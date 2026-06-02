#!/bin/bash
set -e

echo "==> Instalando dependências..."
pip install -r requirements.txt

echo "==> Iniciando aplicativo..."
echo "==> Acesse no navegador: http://localhost:5000"
python app/app.py
