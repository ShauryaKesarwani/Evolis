# Part 6: Environment & Config (Executable)

**Execute this part** to set up environment variables and config. Do this early; other parts depend on it.

---

## Connection Points

| # | Purpose | Where |
|----|---------|--------|
| 30 | Backend base URL | Frontend env (e.g. `NEXT_PUBLIC_API_URL`) for all API calls. |
| 31 | Chain id (BNB testnet/mainnet) | Frontend wallet config; backend RPC. |
| 32 | Factory address | Backend: `FACTORY_ADDRESS`; Frontend: deploy and contribute flows. |
| 33 | Escrow/Token addresses | Per project, from API `project.escrow_address` / `project.token_address`. |

---

## Frontend (`.env.local` or equivalent)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
```

- `NEXT_PUBLIC_API_URL` — backend base URL (e.g. `http://localhost:3001` for local dev)
- `NEXT_PUBLIC_CHAIN_ID` — BNB Chain (56 mainnet, 97 testnet)
- `NEXT_PUBLIC_FACTORY_ADDRESS` — deployed TokenFactory address

---

## Backend (`.env`)

Per `backend/README.md` and `backend/src/config.ts`:

- `PORT` — server port (default 3001)
- `DATABASE_URL` — SQLite path (e.g. `file:./data/dev.sqlite`)
- `RPC_URL` — BNB Chain RPC
- `FACTORY_ADDRESS` — TokenFactory address (for indexer + chain fetch)
- `ADMIN_PRIVATE_KEY` — admin wallet for verifyMilestone
- `ENABLE_INDEXER` — `true` to run indexer
- `CORS_ORIGIN` — allowed frontend origin (e.g. `http://localhost:3000` for Next.js dev)

---

## Deliverables

- [ ] Frontend `.env.local` with API_URL, CHAIN_ID, FACTORY_ADDRESS
- [ ] Backend `.env` with RPC_URL, FACTORY_ADDRESS, ADMIN_PRIVATE_KEY
- [ ] Ensure frontend and backend use same chain and Factory address
