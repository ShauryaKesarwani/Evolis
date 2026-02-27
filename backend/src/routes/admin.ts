import { Hono } from 'hono'
import { z } from 'zod'
import { fetchProjectFromChain, getEscrowContractWithAdmin } from '../chain/client'
import { getProject, upsertMilestone, upsertProject } from '../db'

export const adminRoutes = new Hono()

const verifySchema = z.object({
  projectId: z.number().int().nonnegative(),
  milestoneIndex: z.number().int().nonnegative().optional(),
  proof: z.string().optional(),
  escrowAddress: z.string().optional(),
})

type VerifyBody = z.infer<typeof verifySchema>

adminRoutes.post('/verify-milestone', async (c) => {
  // Use the underlying Request.json() to avoid heavy generic inference in hono's typed helpers.
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
    // Try to hydrate from chain if possible.
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

  // Support both verifyMilestone() and verifyMilestone(uint256)
  let tx: { hash: string; wait: () => Promise<any> }
  if (typeof body.milestoneIndex === 'number') {
    tx = await (escrow as any).verifyMilestone(body.milestoneIndex)
  } else {
    tx = await (escrow as any).verifyMilestone()
  }

  const receipt = await tx.wait()

  if (typeof body.milestoneIndex === 'number') {
    upsertMilestone({
      project_id: body.projectId,
      milestone_index: body.milestoneIndex,
      description: 'Milestone',
      unlock_amount: '0',
      verified: 1,
    })
  }

  return c.json({
    ok: true,
    txHash: tx.hash,
    receipt: {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    },
  })
})
