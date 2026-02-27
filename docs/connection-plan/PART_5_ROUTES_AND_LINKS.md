# Part 5: Route & Link Consistency (Executable)

**Execute this part** to fix routing and navigation. Can be done early and independently.

---

## Connection Points

| # | Issue | Current | Should Be |
|----|-------|---------|-----------|
| 26 | Campaign card link | `CampaignCard.tsx`: `href={/project/${id}}` | Campaign detail route is `app/campaign/[id]/page.tsx`. Use `/campaign/${id}` so cards open the detail page. |
| 27 | Dashboard "View Campaign" / "Manage Project" | Links to `/campaign` (no id) | Use `/campaign/${projectId}` for each project. |
| 28 | FounderActionStrip "Verifications" | `<button>` (no link) | For admin: link to `/admin` (and only show if connected address is admin). |
| 29 | Milestone Submission page | Link exists: `/campaign/${campaignId}/submit-milestone` | Route **does not exist**; add `app/campaign/[id]/submit-milestone/page.tsx` and gate by campaign owner. |

---

## Deliverables

- [ ] CampaignCard: change `href` from `/project/${id}` to `/campaign/${id}`
- [ ] Dashboard InvestmentsGrid: `Link href={/campaign/${inv.id}}` (or equivalent id)
- [ ] Dashboard FounderCampaignsGrid: `Link href={/campaign/${camp.id}}` for "Manage Project"
- [ ] FounderActionStrip: "Verifications" → `<Link href="/admin">` (show only for admin wallet)
- [ ] Add route: `app/campaign/[id]/submit-milestone/page.tsx` (content per Part 7)
