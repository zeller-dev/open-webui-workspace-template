# ollama (shared service)

Standalone Ollama, offline by default (isolated `ollama-net` Docker network).
Any project that joins `ollama-net` can reach this by container name `ollama`
on port 11434 — no per-project Ollama instance needed.

This must be started **before** any client project (like `open-webui/`), since
it's the one that creates the `ollama-net` network.

## Prereqs (host only)

- Nvidia driver
- nvidia-container-toolkit
- Docker + Compose v2
- Node ≥18 (for the model management scripts)

## Setup

    cp .env.example .env    # defaults are fine for most setups
    npm run up

## Commands

    npm run up             # start
    npm run down           # stop, keep model data
    npm run reset          # stop and wipe all data (volumes)
    npm run logs           # tail logs
    npm run list           # list installed models
    npm run auto-import    # import .gguf files from models/ into Ollama

## Getting models (fully offline, no browser)

    npm run search -- "qwen3 14b"
    npm run list-files -- <repo>
    npm run fetch -- <repo> <filename>
    npm run auto-import

See `models/README.md` for the manual-import details (Modelfile format etc).

## Connecting other projects

Any other docker-compose project can reach this Ollama instance by joining
the same network:

    networks:
      ollama-net:
        external: true
        name: ollama-net

    services:
      your-service:
        networks: [ollama-net]
        environment:
          - OLLAMA_BASE_URL=http://ollama:11434

`open-webui/` in this repo is the reference example.

## Notes

- `OLLAMA_KEEP_ALIVE=30m` keeps the model warm in VRAM between requests.
- `OLLAMA_FLASH_ATTENTION` + `OLLAMA_KV_CACHE_TYPE=q8_0` — more efficient
  attention and a compressed context cache, both near-lossless.
- `ollama-net` is `internal: true` — no outbound internet from the container,
  ever. New models come in via `models/` + `npm run auto-import`, or the
  search/fetch scripts above (those run on your host, not in the container).
- No host port is published for Ollama on purpose. `npm run list`/`import` use
  `docker exec`, not HTTP, and other containers reach it over `ollama-net` by
  name — nothing needs `localhost:11434`. This also matters on Docker Desktop
  (Windows/Mac): it silently refuses to publish a port at all for a container
  whose only network is `internal: true`, so trying to add one back here
  won't work anyway without giving the container a second, non-internal
  network (which would also give it a route out to the internet — see how
  `open-webui/docker-compose.yml` does this for the WebUI port instead).
