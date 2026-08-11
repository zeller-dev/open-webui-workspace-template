# Open WebUI Local Workspace

A self-hosted, lightweight containerized setup for [Open WebUI](https://github.com/open-webui/open-webui) and [Ollama](https://ollama.com/), pre-configured for local privacy, RAG document search, and low-latency inference.

---

## 📁 Repository Structure

```text
open-webui/
├── .env.example          # Template for environment variables
├── .gitignore            # Ignores persistent data and local secrets
├── docker-compose.yml    # Defines Open WebUI and Ollama services
├── package.json          # Workspace lifecycle scripts
├── scripts/
│   ├── generate-key.js   # Standalone secret key generator
│   └── setup.js          # Automates .env creation, docker startup & model pulls
└── data/                 # Persistent storage (auto-generated, git-ignored)
    ├── webui/            # SQLite database, uploads, and vector indices
    └── ollama/           # Local LLM model weights

```

---

## 🚀 Quickstart

Ensure **Docker Desktop** and **Node.js** are installed and running on your machine.

### One-Command Setup

Run the setup script:

```bash
npm run setup

```

This single command automatically:

1. Copies `.env.example` to `.env` and injects a generated 32-byte `WEBUI_SECRET_KEY`.
2. Boots up the Docker Compose stack in detached mode.
3. Pulls the base models into Ollama:

* **`nomic-embed-text`** (Required for RAG document processing)
* **`llama3.2:1b`** (Lightweight ~1.3 GB base model for quick startup)

Once complete, open your browser and go to:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Workspace Scripts

| Command | Action |
| --- | --- |
| **`npm run setup`** | Runs full setup (`.env` generation + Docker boot + base model pull) |
| **`npm run generate-key`** | Prints a fresh 32-byte hex secret key to terminal |
| **`npm run up`** | Starts Docker Compose containers (`docker compose up -d`) |
| **`npm run down`** | Stops Docker Compose containers (`docker compose down`) |
| **`npm run logs`** | Streams live logs from all containers (`docker compose logs -f`) |

---

## 📦 Pulling Additional Models

To pull larger or specialized models (e.g., `qwen2.5-coder:7b`, `llama3.1`, `deepseek-r1:8b`), run `docker exec` directly:

```bash
docker exec -it ollama ollama pull <model-name>

```

---

## 🧹 Resetting the Database

If you need to perform a clean reinstall and reset the WebUI state:

```powershell
# 1. Stop containers
npm run down

# 2. Clear WebUI database (keeps pulled model weights in data/ollama intact)
npm run clean

# 3. Restart stack
npm run up

```
