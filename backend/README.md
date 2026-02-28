To install dependencies:
```sh
bun install
```

Create an env file:
```sh
cp .env.example .env
```

To run:
```sh
bun run dev
```

open http://localhost:3001 (default port)

## API

- `GET /health`
- `GET /projects`
- `GET /project/:id`
- `GET /project/:id/milestones`
- `GET /project/:id/contributors`
- `POST /verify-milestone` — requires `x-admin-address` header
- `POST /release-milestone` — requires `x-admin-address` header

`POST /verify-milestone` body (milestoneIndex required):
```json
{ "projectId": 1, "milestoneIndex": 0 }
```

`POST /release-milestone` body:
```json
{ "projectId": 1, "milestoneIndex": 0 }
```

## Indexer (optional)

Set `ENABLE_INDEXER=true` and configure `RPC_URL` + `FACTORY_ADDRESS` to poll TokenDeployed logs and upsert projects into SQLite.
