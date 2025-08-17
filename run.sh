#!/bin/bash
set -e

VENV=".venv"

# 1. Crear venv si no existe
if [ ! -d "$VENV" ]; then
    echo "[INFO] No existe entorno virtual. Creando..."
    python3 -m venv $VENV
    source $VENV/bin/activate
    echo "[INFO] Instalando dependencias..."
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "[INFO] Usando entorno virtual existente."
    source $VENV/bin/activate
    echo "[INFO] Comprobando dependencias..."
    pip install --upgrade pip
    pip install -r requirements.txt --upgrade
fi

# 2. Ejecutar la app
echo "[INFO] Lanzando aplicación..."
python app.py
