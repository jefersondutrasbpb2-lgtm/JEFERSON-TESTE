#!/usr/bin/env python3
"""
Gera o wet_signal.wav (output.wav) para treinar um modelo NAM "Full Rig" (A1).

Pega:
  - um modelo .nam de cabeçote (só amplificador, sem caixa)
  - uma IR (.wav) da caixa escolhida
  - o sweep de referência (input.wav) usado no NAMTrainerColab

E devolve:
  - output.wav = sweep -> cabeçote (.nam) -> convolução com a IR

Esse output.wav é o arquivo que se sobe no NAMTrainerColab junto com o
input.wav original (renomeado como pede o notebook) para treinar um
modelo A1 que já nasce com o cabeçote e a caixa combinados.
"""
import argparse
import json
import sys
import types

# Alguns ambientes não têm tkinter instalado. O pacote neural-amp-modeler
# importa tkinter só para uma função de diálogo de arquivo que não usamos
# aqui, então colocamos um stub pra não travar o import do pacote.
if "tkinter" not in sys.modules:
    try:
        import tkinter  # noqa: F401
    except ImportError:
        sys.modules["tkinter"] = types.ModuleType("tkinter")
        sys.modules["tkinter.filedialog"] = types.ModuleType("tkinter.filedialog")

import numpy as np
import soundfile as sf
import torch
from scipy.signal import fftconvolve, resample_poly

from nam.models import init_from_nam


def load_nam_model(nam_path: str):
    with open(nam_path, "r") as fp:
        config = json.load(fp)
    if config.get("architecture") == "SlimmableContainer":
        # Modelos "A2" (ex: exportados pelo Tone3000) empacotam várias
        # submodelos de qualidades diferentes num container. Usamos o de
        # maior max_value (melhor qualidade) para a inferência.
        submodels = config["config"]["submodels"]
        best = max(submodels, key=lambda s: s["max_value"])
        print(f"  modelo é um SlimmableContainer (A2); usando submodelo max_value={best['max_value']}")
        config = best["model"]
    model = init_from_nam(config)
    model.eval()
    return model


def load_mono(path: str, target_rate: int = None):
    audio, rate = sf.read(path, dtype="float32", always_2d=False)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    if target_rate is not None and rate != target_rate:
        gcd = np.gcd(rate, target_rate)
        audio = resample_poly(audio, target_rate // gcd, rate // gcd)
        rate = target_rate
    return audio.astype(np.float32), rate


def run_amp(model, audio: np.ndarray) -> np.ndarray:
    with torch.no_grad():
        x = torch.from_numpy(audio)
        y = model(x, pad_start=True)
    return y.numpy().astype(np.float32)


def convolve_ir(audio: np.ndarray, ir: np.ndarray) -> np.ndarray:
    wet = fftconvolve(audio, ir, mode="full")[: len(audio) + len(ir) - 1]
    return wet.astype(np.float32)


def normalize_peak(audio: np.ndarray, peak: float = 0.9) -> np.ndarray:
    max_abs = np.abs(audio).max()
    if max_abs > 0:
        audio = audio * (peak / max_abs)
    return audio


def main():
    parser = argparse.ArgumentParser(
        description="Combina um modelo .nam de cabeçote com uma IR de caixa, "
        "gerando o wet_signal.wav pronto para o NAMTrainerColab."
    )
    parser.add_argument("--nam", required=True, help="Caminho do .nam do cabeçote (só amp).")
    parser.add_argument("--ir", required=True, help="Caminho da IR (.wav) da caixa.")
    parser.add_argument("--input", required=True, help="Caminho do input.wav (sweep de referência).")
    parser.add_argument("--output", default="output.wav", help="Caminho do wav de saída (padrão: output.wav).")
    parser.add_argument(
        "--no-normalize", action="store_true",
        help="Não normalizar o pico do áudio final (por padrão normaliza a 0.9 para evitar clipping).",
    )
    args = parser.parse_args()

    print(f"Carregando modelo NAM: {args.nam}")
    model = load_nam_model(args.nam)
    model_rate = getattr(model, "sample_rate", None)
    print(f"  arquitetura carregada, sample_rate do modelo: {model_rate}")

    print(f"Carregando input.wav: {args.input}")
    dry, rate = load_mono(args.input)
    print(f"  sample_rate: {rate} Hz, duração: {len(dry) / rate:.1f}s")

    if model_rate and model_rate != rate:
        print(
            f"  AVISO: o modelo foi treinado a {model_rate} Hz e o input.wav está a {rate} Hz. "
            "Rodando mesmo assim, mas o ideal é usar arquivos na mesma taxa de amostragem do modelo."
        )

    print(f"Carregando IR: {args.ir}")
    ir, ir_rate = load_mono(args.ir, target_rate=rate)
    if ir_rate != rate:
        print(f"  IR reamostrada de {ir_rate} Hz para {rate} Hz.")

    print("Processando: sweep -> cabeçote (.nam)...")
    wet_amp = run_amp(model, dry)

    print("Convoluindo com a IR da caixa...")
    wet_full = convolve_ir(wet_amp, ir)

    if not args.no_normalize:
        wet_full = normalize_peak(wet_full)

    sf.write(args.output, wet_full, rate)
    print(f"Pronto! Arquivo gerado: {args.output}")
    print(
        "Suba esse arquivo no NAMTrainerColab como o 'output.wav' (wet_signal), "
        "junto com o input.wav original usado aqui."
    )


if __name__ == "__main__":
    main()
