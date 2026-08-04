#!/bin/bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [ ! -d ".venv" ]; then
  echo "==> Criando ambiente principal (.venv)..."
  python3 -m venv .venv
fi
echo "==> Instalando dependências principais (isso pode demorar alguns minutos na primeira vez)..."
.venv/bin/pip install -q -r requirements.txt

if [ ! -d ".venv-train" ]; then
  echo "==> Criando ambiente de treino (.venv-train)..."
  python3 -m venv .venv-train
fi
echo "==> Instalando dependências de treino (neural-amp-modeler 0.12.3, formato A1)..."
.venv-train/bin/pip install -q -r requirements-train.txt

export NAM_TRAIN_PYTHON="$DIR/.venv-train/bin/python3"

echo "==> Iniciando o servidor..."
echo "==> Acesse no navegador: http://localhost:5050"
.venv/bin/python3 webapp/app.py
