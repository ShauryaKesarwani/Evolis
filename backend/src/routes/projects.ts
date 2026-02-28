import { Hono } from 'hono'
import { getProject, listContributors, listMilestones, listProjects, upsertProject, updateProjectMeta } from '../db'
import { fetchProjectFromChain, getFactoryContract } from '../chain/client'

export const projectsRoutes = new Hono()

projectsRoutes.get('/projects', (c) => {
  const projects = listProjects()
  return c.json({ projects })
})

/** Frontend calls this after deployment to save campaign metadata */
projectsRoutes.post('/projects', async (c) => {
  try {
    const body = await c.req.json()
    const { name, creator, tagline, logoUrl, websiteUrl, symbol, category } = body

    // Get the latest project ID from the factory contract
    const factory = getFactoryContract()
    const total = Number(await factory.getTotalDeployments())
    const projectId = total - 1

    // Ensure the project is indexed
    let project = getProject(projectId)
    if (!project) {
      try {
        const chainProject = await fetchProjectFromChain(projectId)
        upsertProject(chainProject)
      } catch {}
    }

    // Update with frontend metadata
    updateProjectMeta(projectId, {
      name,
      creator,
      tagline,
      logo_url: logoUrl,
      website_url: websiteUrl,
      symbol,
      category: category || 'DeFi',
    })

    return c.json({ success: true, projectId })
  } catch (err: any) {
    console.error('POST /projects error:', err)
    return c.json({ error: err.message }, 500)
  }
})

projectsRoutes.get('/project/:id', async (c) => {
  const projectId = Number(c.req.param('id'))
  if (!Number.isFinite(projectId)) return c.json({ error: 'Invalid project id' }, 400)

  let project = getProject(projectId)

  // Hackathon-friendly: if DB is empty but chain config exists, attempt a live fetch.
  if (!project) {
    try {
      const chainProject = await fetchProjectFromChain(projectId)
      upsertProject(chainProject)
      project = getProject(projectId)
    } catch {
      // ignore and fall through to 404
    }
  }

  if (!project) return c.json({ error: 'Project not found' }, 404)
  return c.json({ project })
})

projectsRoutes.get('/project/:id/milestones', (c) => {
  const projectId = Number(c.req.param('id'))
  if (!Number.isFinite(projectId)) return c.json({ error: 'Invalid project id' }, 400)

  const milestones = listMilestones(projectId)
  return c.json({ projectId, milestones })
})

projectsRoutes.get('/project/:id/contributors', (c) => {
  const projectId = Number(c.req.param('id'))
  if (!Number.isFinite(projectId)) return c.json({ error: 'Invalid project id' }, 400)

  const contributors = listContributors(projectId)
  return c.json({ projectId, contributors })
})

