#!/bin/bash

# Find the correct Python interpreter
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "Error: Python not found"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"
echo "Installing requests if needed..."
$PYTHON_CMD -m pip install requests --quiet

echo "Running seed script..."
$PYTHON_CMD seed_data.py
