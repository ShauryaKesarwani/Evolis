# Part 3: Backend API Wiring (Executable)

**Execute this part** to connect the frontend to the backend REST API.

---

## Prerequisites

- Part 6 (Environment): `NEXT_PUBLIC_API_URL` set to backend base URL (e.g. `http://localhost:3001`)

---

## Connection Points: Data Fetching

| # | Frontend Location | API Endpoint | Purpose |
|---|--------------------|--------------|---------|
| 11 | `frontend/src/components/home/CampaignGrid.tsx` | `GET /projects` | Replace `dummyCampaigns` with API projects. Map backend `ProjectRow` (id, token_address, escrow_address, creator, funding_goal, total_raised, deadline, status) to card props. |
| 12 | `frontend/src/app/campaign/[id]/page.tsx` | `GET /project/:id` | Replace mock campaign/token/milestones with API + optional chain fallback. Need: project meta, status, total_raised, deadline for progress and token price. |
| 13 | Same (Campaign Detail) | `GET /project/:id/milestones` | Populate `MilestoneTracker`; map backend `MilestoneRow` (milestone_index, description, unlock_amount, verified, released) to UI milestone status. |
| 14 | Same (Campaign Detail) | `GET /project/:id/contributors` | Populate ActivityFeed / supporter count; map backend `contributor` + `amount` to "recent purchases" or aggregate. |
| 15 | `frontend/src/app/dashboard/page.tsx` | `GET /projects` (filter by creator or contributor) | "My Campaigns": filter by `creator === address`; "My Investments": filter by contributions (may need backend support or client filter if API returns per-project contributors). |
| 16 | `frontend/src/app/admin/page.tsx` | `GET /project/:id` + `GET /project/:id/milestones` | Load projects and milestones for admin; show pending (submitted, not verified) milestones for approval. |

---

## Connection Points: Actions (Admin)

| # | Frontend Location | API Endpoint | Purpose |
|---|--------------------|--------------|---------|
| 17 | `frontend/src/app/admin/page.tsx` | `POST /verify-milestone` | On "Approve": send `{ projectId, milestoneIndex }` with `x-admin-address` header. Backend calls Escrow.verifyMilestone(milestoneIndex). milestoneIndex is required. |
| 18 | Same | `POST /release-milestone` | On "Release funds": send `{ projectId, milestoneIndex }` with `x-admin-address` header. Backend calls Escrow.releaseMilestoneFunds(milestoneIndex). Two-step flow: verify first, then release. |

---

## Backend Response Shapes

- `GET /projects` → `{ projects: ProjectRow[] }`
- `GET /project/:id` → `{ project: ProjectRow }` (or 404)
- `GET /project/:id/milestones` → `{ projectId, milestones: MilestoneRow[] }`
- `GET /project/:id/contributors` → `{ projectId, contributors: { contributor, amount }[] }`

**POST /verify-milestone** — requires `x-admin-address` header. Body: `{ projectId: number, milestoneIndex: number }` (milestoneIndex required)

**POST /release-milestone** — requires `x-admin-address` header. Body: `{ projectId: number, milestoneIndex: number }`

---

## Deliverables

- [ ] API client / fetch helper using `NEXT_PUBLIC_API_URL`
- [ ] CampaignGrid fetches `GET /projects` and maps to CampaignCard
- [ ] Campaign Detail fetches project, milestones, contributors
- [ ] Dashboard filters projects by creator/contributor (or backend extends API)
- [ ] Admin fetches projects/milestones; "Approve" calls POST /verify-milestone (with x-admin-address); "Release" calls POST /release-milestone
