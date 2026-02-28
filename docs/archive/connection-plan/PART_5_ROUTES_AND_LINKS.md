# Part 5: Route & Link Consistency (Executable)

**Execute this part** to fix routing and navigation. Several items are already done.

---

## Connection Points

| # | Issue | Current | Status |
|----|-------|---------|--------|
| 26 | Campaign card link | `CampaignCard.tsx` | **Fixed** — links to `/campaign/${id}` |
| 27 | Dashboard "View Campaign" / "Manage Project" | Links to `/campaign/${inv.id}` and `/campaign/${camp.id}` | **Fixed** |
| 28 | FounderActionStrip "Verifications" | `<button>` (no link) | **TODO** — For admin: link to `/admin` (show only if connected address is admin). |
| 29 | Milestone Submission page | `/campaign/[id]/submit-milestone` | **Done** — Route exists; gate by campaign owner. |

---

## Deliverables

- [x] CampaignCard: uses `/campaign/${id}`
- [x] Dashboard: uses `/campaign/${inv.id}` and `/campaign/${camp.id}` and `/campaign/${camp.id}/submit-milestone`
- [ ] FounderActionStrip: "Verifications" → `<Link href="/admin">` (show only for admin wallet)
