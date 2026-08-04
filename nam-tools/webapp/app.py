#!/usr/bin/env python3
"""
Interface web para o fluxo completo: cabeçote (.nam) + IR de caixa (.wav)
+ sweep (input.wav) -> wet_signal -> treino local -> model.nam (A1).

Roda com o Python/venv que tem o requirements.txt deste diretório
instalado (o mesmo usado pelo blend.py). O treino usa um interpretador
Python separado (venv com neural-amp-modeler==0.12.3), configurado via
a variável de ambiente NAM_TRAIN_PYTHON ou o caminho padrão
nam-tools/.venv-train/bin/python3 — veja o README para criar essa venv.
"""
import json
import os
import re
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_file, send_from_directory, render_template

NAM_TOOLS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(NAM_TOOLS_DIR))
import blend  # noqa: E402  (nam-tools/blend.py)

JOBS_DIR = Path(__file__).resolve().parent / "jobs"
JOBS_DIR.mkdir(exist_ok=True)

DEFAULT_TRAIN_PYTHON = NAM_TOOLS_DIR / ".venv-train" / "bin" / "python3"
TRAIN_PYTHON = os.environ.get("NAM_TRAIN_PYTHON", str(DEFAULT_TRAIN_PYTHON))
TRAIN_SCRIPT = NAM_TOOLS_DIR / "train_full_rig.py"

app = Flask(__name__)

# Estado dos jobs em memória (ferramenta local, single-process).
_jobs_lock = threading.Lock()
_jobs = {}

UPLOAD_KINDS = {
    "head": "head.nam",
    "ir": "ir.wav",
    "input": "input.wav",
}
PLAYABLE_FILES = {"ir.wav", "input.wav", "output.wav"}


def _job_dir(job_id: str) -> Path:
    return JOBS_DIR / job_id


def _get_or_init_job(job_id: str) -> dict:
    """Garante uma entrada em memória para o job, mesmo que o processo
    tenha reiniciado (o diretório em disco sobrevive, o estado em RAM não)."""
    with _jobs_lock:
        if job_id not in _jobs:
            state = _new_job_state()
            job_dir = _job_dir(job_id)
            for kind, fname in UPLOAD_KINDS.items():
                if (job_dir / fname).exists():
                    state["files"][kind] = fname
            if (job_dir / "output.wav").exists():
                state["blend_status"] = "done"
            if (job_dir / "exported_model" / "model.nam").exists():
                state["train_status"] = "done"
            _jobs[job_id] = state
        return _jobs[job_id]


def _new_job_state():
    return {
        "blend_status": "idle",  # idle | running | done | error
        "train_status": "idle",
        "files": {},
        "train_params": {},
    }


def _log(job_dir: Path, name: str, line: str):
    with open(job_dir / name, "a") as fp:
        fp.write(line.rstrip("\n") + "\n")


def _tail(path: Path, max_lines: int = 400) -> str:
    if not path.exists():
        return ""
    lines = path.read_text(errors="replace").splitlines()
    return "\n".join(lines[-max_lines:])


def _run_blend_job(job_id: str):
    job_dir = _job_dir(job_id)
    log_path = job_dir / "blend.log"
    log_path.write_text("")
    try:
        _log(job_dir, "blend.log", "Carregando modelo NAM do cabeçote...")
        model = blend.load_nam_model(str(job_dir / "head.nam"))
        model_rate = getattr(model, "sample_rate", None)
        _log(job_dir, "blend.log", f"  sample_rate do modelo: {model_rate}")

        _log(job_dir, "blend.log", "Carregando input.wav (sweep)...")
        dry, rate = blend.load_mono(str(job_dir / "input.wav"))
        _log(job_dir, "blend.log", f"  sample_rate: {rate} Hz, duração: {len(dry) / rate:.1f}s")
        if model_rate and model_rate != rate:
            _log(job_dir, "blend.log", f"  AVISO: modelo treinado a {model_rate} Hz, input a {rate} Hz.")

        _log(job_dir, "blend.log", "Carregando IR da caixa...")
        ir, ir_rate = blend.load_mono(str(job_dir / "ir.wav"), target_rate=rate)
        if ir_rate != rate:
            _log(job_dir, "blend.log", f"  IR reamostrada de {ir_rate} Hz para {rate} Hz.")

        _log(job_dir, "blend.log", "Processando: sweep -> cabeçote (.nam)...")
        wet_amp = blend.run_amp(model, dry)

        _log(job_dir, "blend.log", "Convoluindo com a IR da caixa...")
        wet_full = blend.convolve_ir(wet_amp, ir)
        wet_full = blend.normalize_peak(wet_full)

        import soundfile as sf
        sf.write(str(job_dir / "output.wav"), wet_full, rate)
        _log(job_dir, "blend.log", "Pronto! output.wav gerado com sucesso.")

        with _jobs_lock:
            _jobs[job_id]["blend_status"] = "done"
    except Exception as e:  # noqa: BLE001
        _log(job_dir, "blend.log", f"ERRO: {e}")
        with _jobs_lock:
            _jobs[job_id]["blend_status"] = "error"


def _run_train_job(job_id: str, params: dict):
    job_dir = _job_dir(job_id)
    log_path = job_dir / "train.log"
    log_path.write_text("")
    train_dir = job_dir / "training_run"
    export_dir = job_dir / "exported_model"

    if not Path(TRAIN_PYTHON).exists():
        _log(job_dir, "train.log",
             f"ERRO: não encontrei o Python de treino em {TRAIN_PYTHON}. "
             "Crie a venv de treino conforme o README (nam-tools/.venv-train) "
             "ou configure a variável de ambiente NAM_TRAIN_PYTHON.")
        with _jobs_lock:
            _jobs[job_id]["train_status"] = "error"
        return

    cmd = [
        TRAIN_PYTHON, "-u", str(TRAIN_SCRIPT),
        "--input", str(job_dir / "input.wav"),
        "--output", str(job_dir / "output.wav"),
        "--train-dir", str(train_dir),
        "--export-dir", str(export_dir),
        "--epochs", str(params.get("epochs", 100)),
        "--name", params.get("name", "My model"),
        "--modeled-by", params.get("modeled_by", ""),
        "--gear-make", params.get("gear_make", ""),
        "--gear-model", params.get("gear_model", ""),
        "--gear-type", params.get("gear_type", "amp_cab"),
        "--tone-type", params.get("tone_type", "crunch"),
    ]
    if params.get("ignore_checks", True):
        cmd.append("--ignore-checks")

    try:
        with open(log_path, "a") as log_fp:
            proc = subprocess.Popen(cmd, stdout=log_fp, stderr=subprocess.STDOUT, cwd=str(NAM_TOOLS_DIR))
            with _jobs_lock:
                _jobs[job_id]["train_pid"] = proc.pid
            proc.wait()

        if proc.returncode == 0 and (export_dir / "model.nam").exists():
            with _jobs_lock:
                _jobs[job_id]["train_status"] = "done"
        else:
            with _jobs_lock:
                _jobs[job_id]["train_status"] = "error"
    except Exception as e:  # noqa: BLE001
        _log(job_dir, "train.log", f"ERRO ao iniciar treino: {e}")
        with _jobs_lock:
            _jobs[job_id]["train_status"] = "error"


def _parse_epoch_progress(log_text: str):
    matches = re.findall(r"Epoch (\d+)/(\d+)", log_text)
    if not matches:
        return None
    current, total = matches[-1]
    return {"epoch": int(current), "total_epoch_index": int(total)}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/job", methods=["POST"])
def create_job():
    job_id = uuid.uuid4().hex[:12]
    job_dir = _job_dir(job_id)
    job_dir.mkdir(parents=True, exist_ok=True)
    with _jobs_lock:
        _jobs[job_id] = _new_job_state()
    return jsonify({"job_id": job_id})


@app.route("/api/job/<job_id>/upload/<kind>", methods=["POST"])
def upload_file(job_id, kind):
    if kind not in UPLOAD_KINDS:
        return jsonify({"error": "tipo de arquivo inválido"}), 400
    job_dir = _job_dir(job_id)
    if not job_dir.exists():
        return jsonify({"error": "job não encontrado"}), 404
    _get_or_init_job(job_id)
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "nenhum arquivo enviado"}), 400
    dest = job_dir / UPLOAD_KINDS[kind]
    f.save(dest)
    with _jobs_lock:
        _jobs[job_id]["files"][kind] = dest.name
    return jsonify({"ok": True, "filename": f.filename})


@app.route("/api/job/<job_id>/blend", methods=["POST"])
def start_blend(job_id):
    job_dir = _job_dir(job_id)
    if not job_dir.exists():
        return jsonify({"error": "job não encontrado"}), 404
    _get_or_init_job(job_id)
    for kind, fname in UPLOAD_KINDS.items():
        if not (job_dir / fname).exists():
            return jsonify({"error": f"faltando arquivo: {kind}"}), 400
    with _jobs_lock:
        if _jobs[job_id]["blend_status"] == "running":
            return jsonify({"error": "já está processando"}), 409
        _jobs[job_id]["blend_status"] = "running"
    threading.Thread(target=_run_blend_job, args=(job_id,), daemon=True).start()
    return jsonify({"ok": True})


@app.route("/api/job/<job_id>/train", methods=["POST"])
def start_train(job_id):
    job_dir = _job_dir(job_id)
    if not job_dir.exists():
        return jsonify({"error": "job não encontrado"}), 404
    _get_or_init_job(job_id)
    if not (job_dir / "output.wav").exists():
        return jsonify({"error": "gere o wet signal primeiro"}), 400

    data = request.get_json(force=True, silent=True) or {}
    params = {
        "epochs": max(1, min(500, int(data.get("epochs", 100)))),
        "name": (data.get("name") or "My model")[:80],
        "modeled_by": (data.get("modeled_by") or "")[:80],
        "gear_make": (data.get("gear_make") or "")[:80],
        "gear_model": (data.get("gear_model") or "")[:80],
        "gear_type": data.get("gear_type", "amp_cab"),
        "tone_type": data.get("tone_type", "crunch"),
        "ignore_checks": bool(data.get("ignore_checks", True)),
    }

    with _jobs_lock:
        if _jobs[job_id]["train_status"] == "running":
            return jsonify({"error": "já está treinando"}), 409
        _jobs[job_id]["train_status"] = "running"
        _jobs[job_id]["train_params"] = params
    threading.Thread(target=_run_train_job, args=(job_id, params), daemon=True).start()
    return jsonify({"ok": True})


@app.route("/api/job/<job_id>/status")
def job_status(job_id):
    job_dir = _job_dir(job_id)
    if not job_dir.exists():
        return jsonify({"error": "job não encontrado"}), 404
    state = dict(_get_or_init_job(job_id))

    blend_log = _tail(job_dir / "blend.log")
    train_log = _tail(job_dir / "train.log")
    progress = _parse_epoch_progress(train_log)
    total_epochs = state.get("train_params", {}).get("epochs")

    return jsonify({
        "blend_status": state["blend_status"],
        "blend_log": blend_log,
        "train_status": state["train_status"],
        "train_log": train_log,
        "train_progress": progress,
        "train_total_epochs": total_epochs,
        "has_output": (job_dir / "output.wav").exists(),
        "has_model": (job_dir / "exported_model" / "model.nam").exists(),
        "files": state["files"],
    })


@app.route("/api/job/<job_id>/file/<name>")
def get_file(job_id, name):
    if name not in PLAYABLE_FILES:
        return jsonify({"error": "arquivo não permitido"}), 400
    job_dir = _job_dir(job_id)
    if not (job_dir / name).exists():
        return jsonify({"error": "não encontrado"}), 404
    return send_from_directory(job_dir, name)


@app.route("/api/job/<job_id>/download")
def download_model(job_id):
    job_dir = _job_dir(job_id)
    model_path = job_dir / "exported_model" / "model.nam"
    if not model_path.exists():
        return jsonify({"error": "modelo ainda não foi treinado"}), 404
    download_name = f"{job_id}_model_A1.nam"
    return send_file(model_path, as_attachment=True, download_name=download_name)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)
