# llm-stack

Two independent projects sharing one Ollama instance over a Docker network.

    llm-stack/
      ollama/       — the shared service: GPU, models, model management
      open-webui/   — a client: chat UI, no models of its own

Any future project (a coding tool, another UI, a script) can join the same
`ollama-net` network and reach Ollama at `http://ollama:11434` — see
`ollama/README.md` → "Connecting other projects".

## Start order matters

`ollama/` creates the `ollama-net` network. `npm run up` at the root handles
the order for you (Ollama first, then Open WebUI):

    npm run up

Individual commands still work per-project if you need them:

    npm run down            # stop both (webui first, then ollama)
    npm run reset           # stop + wipe both
    npm run logs:ollama     # tail Ollama logs
    npm run logs:webui      # tail Open WebUI logs
    npm run list            # list installed models
    npm run auto-import     # import .gguf files from ollama/models/
    npm run search -- "qwen3 14b"
    npm run list-files -- <repo>
    npm run fetch -- <repo> <filename>

Or `cd` into either `ollama/` or `open-webui/` and run their scripts directly
— see each folder's own README for the full list.

## Migrating from the old combined folder

If you're moving from the single `local-llm-stack/` folder:

1. Copy any `.gguf` files from the old `models/` into `llm-stack/ollama/models/`
2. Run `cd llm-stack/ollama && npm run up && npm run auto-import`
3. Start the new webui: `cd ../open-webui && npm run up`
4. Your old Open WebUI chat history/settings were in a Docker volume
   (`open_webui_data`) tied to the old compose project name — it won't
   carry over automatically. If you need it, you'd have to manually copy
   that named volume's contents into the new project's volume, or just
   start fresh (safest, if chat history isn't important to keep).
5. Once confirmed working, `cd local-llm-stack && npm run reset` to remove
   the old containers/volumes/network.