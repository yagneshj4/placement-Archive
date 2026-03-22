# ML Service Startup Guide

This directory contains scripts to start the ML Service with the **correct Python virtual environment**.

## Quick Start

### PowerShell (Recommended for Windows)
```powershell
# Simple start on default port 8000
.\start-ml-service.ps1

# Start on custom port
.\start-ml-service.ps1 -Port 9000

# Start without auto-reload
.\start-ml-service.ps1 -NoReload

# Show help
.\start-ml-service.ps1 -Help
```

### Batch (CMD)
```batch
# Simple start on default port 8000
start-ml-service.bat

# Start on custom port
start-ml-service.bat 9000

# Start without auto-reload
start-ml-service.bat 8000 --no-reload

# Show help
start-ml-service.bat --help
```

### Manual (Raw Command)
```bash
# Using absolute path (most reliable)
c:\Users\HP\OneDrive\Desktop\r2\placement-archive\ml-service\venv\Scripts\python.exe \
  -m uvicorn main:app --reload --port 8000 --host 127.0.0.1

# Using relative path (from ml-service directory)
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

## ⚠️ Important: Use the Correct Python

**DO NOT use** the root workspace venv:
```bash
# ❌ WRONG - This will fail with "ModuleNotFoundError: No module named 'shap'"
c:\Users\HP\OneDrive\Desktop\r2\.venv\Scripts\python.exe -m uvicorn main:app

# ✅ CORRECT - Use the ml-service venv
c:\Users\HP\OneDrive\Desktop\r2\placement-archive\ml-service\venv\Scripts\python.exe -m uvicorn main:app
```

The ML service has its own isolated virtual environment at `./venv/` with all required packages (shap, xgboost, joblib, etc.).

## Service Endpoints

Once running, the service provides:

- **Swagger UI (Docs)**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
- **JSON Schema**: http://127.0.0.1:8000/openapi.json

## Available Models

The ML service loads 4 models on startup:

1. **Embedding Model** (`all-MiniLM-L6-v2`) - 5-10 seconds
2. **ChromaDB** - <1 second  
3. **Auto-tagging Classifiers** (2 models) - 1-2 seconds
4. **XGBoost Difficulty Model** (if available) - <1 second

Total startup time: **10-15 seconds**

## Troubleshooting

### Error: "No module named 'shap'"
- Ensure you're using `ml-service\venv\Scripts\python.exe`, not the root venv
- Run: `.\venv\Scripts\pip list | Select-String shap`

### Error: "ModuleNotFoundError: No module named 'main'"
- Ensure you're running from the `ml-service` directory
- Check that `main.py` exists in current directory

### Port Already in Use
- Start on a different port: `.\start-ml-service.ps1 -Port 9000`
- Or kill the process: `netstat -ano | Select-String :8000`

### Slow Model Loading
- First startup downloads models from HuggingFace (~500MB)
- Subsequent startups use cached models (much faster)
- Set `HF_TOKEN` env var for faster downloads (HuggingFace token)

## Auto-Reload vs Production

- **Development** (with `--reload`):
  - Restarts server when code changes
  - Slower startup, useful during development
  
- **Production** (without `--reload`):
  - Run: `.\start-ml-service.ps1 -NoReload`
  - Faster, more stable, recommended for production

## Next Steps

1. Open http://127.0.0.1:8000/docs in browser
2. Try test endpoints (e.g., `/health`, `/embedding/status`)
3. Run Node.js backend: `npm start` from `/server` directory
4. Start React frontend: `npm run dev` from `/client` directory
