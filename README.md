## Monorepo

This repository is configured as a workspace monorepo.

Workspace layout:

- `apps/*`
- `libs/*`
- `program`

Common commands from repo root:

- `bun run dev` (starts all apps in parallel)
- `bun run start` (starts all apps in parallel)
- `bun run dev:server`
- `bun run dev:web`
- `bun run start:server`
- `bun run start:bot`
- `bun run build:web`
- `bun run build:extension`
- `bun run format`

