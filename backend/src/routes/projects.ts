import { Hono } from 'hono'
import { getProject, listContributors, listMilestones, listProjects, upsertProject } from '../db'
import { fetchProjectFromChain } from '../chain/client'

export const projectsRoutes = new Hono()

projectsRoutes.get('/projects', (c) => {
  const projects = listProjects()
  return c.json({ projects })
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
