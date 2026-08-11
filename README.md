# local-llm-stack

Ollama + Open WebUI, containerized. Everything lives here — no host installs beyond
Docker and the Nvidia driver/toolkit.

## Prereqs (host only)

- Nvidia driver
- nvidia-container-toolkit
- Docker + Compose v2
- Node/npm (just to run the scripts)

## Setup

    cp .env.example .env    # adjust ports/model/timezone if needed
    npm run up

## Commands

    npm run up            # start
    npm run down          # stop, keep model data
    npm run reset         # stop and wipe all data (volumes)
    npm run logs          # tail logs
    npm run pull -- qwen3:14b   # pull a model (note the --)
    npm run list           # list installed models

## URLs

- Ollama API: <http://localhost:${OLLAMA_PORT}> (default 11434)
- Web UI: <http://localhost:${WEBUI_PORT}> (default 3000)

## Structure

- `docker-compose.yml` — the two services + healthcheck, log rotation, GPU passthrough
- `package.json` — npm script shortcuts around docker compose
- `.env` — your local config (ports, default model, auth). Gitignored.
- `.env.example` — template to copy from, safe to commit
- `.gitignore` — keeps `.env`, `node_modules`, and logs out of version control

Model weights and chat history live in Docker named volumes (`ollama_data`,
`open_webui_data`), not in this folder — `npm run reset` deletes them.

## Notes

- Healthcheck on `ollama` means `open-webui` waits until Ollama is actually ready.
- Log rotation (10MB x 3 files per service) keeps container logs from growing unbounded.
- `WEBUI_AUTH=false` in `.env` disables the login screen if this stays on a trusted machine only.
