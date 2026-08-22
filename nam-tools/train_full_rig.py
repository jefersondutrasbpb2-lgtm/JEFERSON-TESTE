#!/usr/bin/env python3
"""
Treina um modelo NAM A1 "Full Rig" (cabeçote + caixa) localmente, sem usar o
Google Colab — faz a mesma coisa que o notebook NAMTrainerColab faz.

Requer o pacote `neural-amp-modeler==0.12.3` (versão mais antiga; a 0.13+
não exporta mais no formato A1/"standard" que pedais como a Sonicake
Pocket Master conseguem ler). Recomenda-se instalar essa versão num
ambiente virtual separado do resto do projeto:

    python3 -m venv .venv-train
    source .venv-train/bin/activate
    pip install neural-amp-modeler==0.12.3

Uso:
    python train_full_rig.py --input input.wav --output output.wav \
        --train-dir treino --epochs 100 --name "Meu Rig" --ignore-checks
"""
import argparse
import sys
import types
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # sem GUI/tkinter disponível neste ambiente

# nam.train.__init__ importa nam.train.gui, que precisa de um tkinter de
# verdade só para a interface gráfica de desktop (que não usamos aqui).
# Registramos um módulo vazio no lugar para pular essa importação, e damos
# um stub simples de tkinter para o "import tkinter" direto em core.py.
sys.modules.setdefault("nam.train.gui", types.ModuleType("nam.train.gui"))
try:
    import tkinter  # noqa: F401
except ImportError:
    sys.modules.setdefault("tkinter", types.ModuleType("tkinter"))

from nam.models.metadata import GearType, ToneType, UserMetadata
from nam.train.core import train


def main():
    parser = argparse.ArgumentParser(
        description="Treina um modelo NAM A1 Full Rig localmente (equivalente ao NAMTrainerColab)."
    )
    parser.add_argument("--input", required=True, help="Sweep de referência (input.wav).")
    parser.add_argument("--output", required=True, help="Sinal 'molhado' (wet_signal/output.wav), ex: gerado pelo blend.py.")
    parser.add_argument("--train-dir", default="training_run", help="Pasta para checkpoints/logs do treino.")
    parser.add_argument("--export-dir", default="exported_model", help="Pasta onde o model.nam final será salvo.")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--name", default="My model", help="Nome do modelo (metadado).")
    parser.add_argument("--modeled-by", default="", help="Autor (metadado).")
    parser.add_argument("--gear-make", default="", help="Fabricante do equipamento (metadado).")
    parser.add_argument("--gear-model", default="", help="Modelo do equipamento (metadado).")
    parser.add_argument(
        "--gear-type", default="amp_cab",
        choices=["amp", "pedal", "pedal_amp", "amp_cab", "amp_pedal_cab", "preamp", "studio"],
    )
    parser.add_argument(
        "--tone-type", default="crunch",
        choices=["clean", "overdrive", "crunch", "hi_gain", "fuzz"],
    )
    parser.add_argument("--ignore-checks", action="store_true", help="Pula as checagens de qualidade do sinal.")
    parser.add_argument("--fast-dev-run", type=int, default=0, help="Só p/ teste: roda N passos e para (não gera modelo usável).")
    args = parser.parse_args()

    Path(args.train_dir).mkdir(parents=True, exist_ok=True)

    user_metadata = UserMetadata(
        name=args.name,
        modeled_by=args.modeled_by,
        gear_make=args.gear_make,
        gear_model=args.gear_model,
        gear_type=GearType(args.gear_type),
        tone_type=ToneType(args.tone_type),
    )

    print("Iniciando treinamento (arquitetura A1 'standard', igual ao NAMTrainerColab)...")
    train_output = train(
        input_path=args.input,
        output_path=args.output,
        train_path=args.train_dir,
        epochs=args.epochs,
        architecture="standard",
        ignore_checks=args.ignore_checks,
        local=True,
        silent=True,
        user_metadata=user_metadata,
        fast_dev_run=args.fast_dev_run if args.fast_dev_run else False,
    )

    if train_output is None or train_output.model is None:
        print("Treino não retornou um modelo (falhou nas checagens de qualidade). "
              "Use --ignore-checks se tiver certeza de que os arquivos estão corretos.")
        sys.exit(1)

    if args.fast_dev_run:
        print("fast-dev-run concluído (apenas teste, modelo não foi exportado).")
        return

    export_dir = Path(args.export_dir)
    export_dir.mkdir(parents=True, exist_ok=True)
    train_output.model.net.export(export_dir, user_metadata=user_metadata)
    print(f"Modelo exportado em: {export_dir / 'model.nam'}")


if __name__ == "__main__":
    main()
