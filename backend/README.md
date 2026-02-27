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

open http://localhost:3000

## API

- `GET /health`
- `GET /projects`
- `GET /project/:id`
- `GET /project/:id/milestones`
- `GET /project/:id/contributors`
- `POST /verify-milestone`

`POST /verify-milestone` body:
```json
{ "projectId": 1, "milestoneIndex": 0 }
```

## Indexer (optional)

Set `ENABLE_INDEXER=true` and configure `RPC_URL` + `FACTORY_ADDRESS` to have the backend poll `ProjectCreated` logs and upsert projects into SQLite.
