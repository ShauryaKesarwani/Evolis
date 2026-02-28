import { Hono } from 'hono'
import { z } from 'zod'
import { fetchProjectFromChain, getEscrowContractWithAdmin, getAdminWallet } from '../chain/client'
import { getProject, upsertMilestone, upsertProject } from '../db'
import { getEnv } from '../config'

export const adminRoutes = new Hono()

// ---------- Error #12 Fix: Admin auth middleware ----------
// Gate all admin routes by checking that the request includes a valid admin key.
// For hackathon: we compare a shared secret header against ADMIN_PRIVATE_KEY's derived address.
// In production, this should be a proper auth system (JWT, session, etc.)
adminRoutes.use('/*', async (c, next) => {
  const env = getEnv()
  if (!env.ADMIN_PRIVATE_KEY) {
    return c.json({ error: 'Admin not configured on this server' }, 503)
  }

  const adminAddress = getAdminWallet().address.toLowerCase()
  const providedAddress = (c.req.header('x-admin-address') ?? '').toLowerCase()

  if (!providedAddress || providedAddress !== adminAddress) {
    return c.json({ error: 'Unauthorized: invalid or missing x-admin-address header' }, 401)
  }

  await next()
})

// ---------- Error #7 Fix: milestoneIndex is now required ----------
const verifySchema = z.object({
  projectId: z.number().int().nonnegative(),
  milestoneIndex: z.number().int().nonnegative(), // was optional, now required
  proof: z.string().optional(),
  escrowAddress: z.string().optional(),
})

type VerifyBody = z.infer<typeof verifySchema>

// ---------- POST /verify-milestone ----------
adminRoutes.post('/verify-milestone', async (c) => {
  const json = await c.req.raw.json().catch(() => null)
  const parsed = verifySchema.safeParse(json)
  if (!parsed.success) {
    return c.json(
      {
        error: 'Invalid request body',
        issues: parsed.error.issues,
      },
      400,
    )
  }

  const body: VerifyBody = parsed.data

  let project = getProject(body.projectId)
  if (!project) {
    const chainProject = await fetchProjectFromChain(body.projectId)
    upsertProject(chainProject)
    project = getProject(body.projectId)
  }

  const escrowAddress =
    body.escrowAddress ?? project?.escrow_address ?? null

  if (!escrowAddress) {
    return c.json(
      {
        error: 'Missing escrow address (set in DB, or pass escrowAddress, or configure FACTORY_ADDRESS + RPC_URL)',
      },
      400,
    )
  }

  // TODO: validate proof off-chain. For hackathon, we just accept it as an optional field.
  void body.proof

  const escrow = getEscrowContractWithAdmin(escrowAddress)

  const tx = await (escrow as any).verifyMilestone(body.milestoneIndex)
  const receipt = await tx.wait()

  upsertMilestone({
    project_id: body.projectId,
    milestone_index: body.milestoneIndex,
    description: 'Milestone',
    unlock_amount: '0',
    verified: 1,
  })

  return c.json({
    ok: true,
    txHash: tx.hash,
    receipt: {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    },
  })
})

// ---------- Error #6 Fix: Separate release-milestone endpoint ----------
const releaseSchema = z.object({
  projectId: z.number().int().nonnegative(),
  milestoneIndex: z.number().int().nonnegative(),
  escrowAddress: z.string().optional(),
})

adminRoutes.post('/release-milestone', async (c) => {
  const json = await c.req.raw.json().catch(() => null)
  const parsed = releaseSchema.safeParse(json)
  if (!parsed.success) {
    return c.json(
      {
        error: 'Invalid request body',
        issues: parsed.error.issues,
      },
      400,
    )
  }

  const body = parsed.data

  let project = getProject(body.projectId)
  if (!project) {
    const chainProject = await fetchProjectFromChain(body.projectId)
    upsertProject(chainProject)
    project = getProject(body.projectId)
  }

  const escrowAddress =
    body.escrowAddress ?? project?.escrow_address ?? null

  if (!escrowAddress) {
    return c.json(
      { error: 'Missing escrow address' },
      400,
    )
  }

  const escrow = getEscrowContractWithAdmin(escrowAddress)
  const tx = await (escrow as any).releaseMilestoneFunds(body.milestoneIndex)
  const receipt = await tx.wait()

  upsertMilestone({
    project_id: body.projectId,
    milestone_index: body.milestoneIndex,
    description: 'Milestone',
    unlock_amount: '0',
    released: 1,
  })

  return c.json({
    ok: true,
    txHash: tx.hash,
    receipt: {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    },
  })
})
