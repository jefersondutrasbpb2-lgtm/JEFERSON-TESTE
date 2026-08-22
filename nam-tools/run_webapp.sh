#!/bin/bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# No Windows (Git Bash), os venvs guardam os executáveis em Scripts/, não
# em bin/ como no Linux/Mac. Detectamos qual existe depois de criar o venv.
venv_python() {
  local venv_dir="$1"
  if [ -f "$venv_dir/bin/python3" ]; then
    echo "$venv_dir/bin/python3"
  elif [ -f "$venv_dir/bin/python" ]; then
    echo "$venv_dir/bin/python"
  elif [ -f "$venv_dir/Scripts/python.exe" ]; then
    echo "$venv_dir/Scripts/python.exe"
  else
    echo ""
  fi
}

PY=python3
command -v python3 >/dev/null 2>&1 || PY=python

if [ ! -d ".venv" ]; then
  echo "==> Criando ambiente principal (.venv)..."
  "$PY" -m venv .venv
fi
VENV_PY="$(venv_python .venv)"
if [ -z "$VENV_PY" ]; then
  echo "ERRO: não encontrei o Python dentro de .venv. Apague a pasta .venv e rode de novo."
  exit 1
fi
echo "==> Instalando dependências principais (isso pode demorar alguns minutos na primeira vez)..."
"$VENV_PY" -m pip install -q -r requirements.txt

if [ ! -d ".venv-train" ]; then
  echo "==> Criando ambiente de treino (.venv-train)..."
  "$PY" -m venv .venv-train
fi
VENV_TRAIN_PY="$(venv_python .venv-train)"
if [ -z "$VENV_TRAIN_PY" ]; then
  echo "ERRO: não encontrei o Python dentro de .venv-train. Apague a pasta .venv-train e rode de novo."
  exit 1
fi
echo "==> Instalando dependências de treino (neural-amp-modeler 0.12.3, formato A1)..."
"$VENV_TRAIN_PY" -m pip install -q -r requirements-train.txt

export NAM_TRAIN_PYTHON="$VENV_TRAIN_PY"

echo "==> Iniciando o servidor..."
echo "==> Acesse no navegador: http://localhost:5050"
"$VENV_PY" webapp/app.py
