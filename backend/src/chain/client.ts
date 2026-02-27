import { Contract, JsonRpcProvider, Wallet } from 'ethers'
import { getEnv } from '../config'
import { escrowAbi, factoryAbi } from './abis'

export function getProvider() {
  const env = getEnv()
  if (!env.RPC_URL) throw new Error('RPC_URL is required')
  return new JsonRpcProvider(env.RPC_URL)
}

export function getFactoryContract() {
  const env = getEnv()
  if (!env.FACTORY_ADDRESS) throw new Error('FACTORY_ADDRESS is required')
  return new Contract(env.FACTORY_ADDRESS, factoryAbi, getProvider())
}

export function getAdminWallet() {
  const env = getEnv()
  if (!env.ADMIN_PRIVATE_KEY) throw new Error('ADMIN_PRIVATE_KEY is required')
  return new Wallet(env.ADMIN_PRIVATE_KEY, getProvider())
}

export function getEscrowContract(escrowAddress: string) {
  return new Contract(escrowAddress, escrowAbi, getProvider())
}

export function getEscrowContractWithAdmin(escrowAddress: string) {
  return getEscrowContract(escrowAddress).connect(getAdminWallet())
}

export async function fetchProjectFromChain(projectId: number) {
  const factory = getFactoryContract()
  const meta = await factory.getProject(projectId)

  // Ethers v6 structs come back as both array + named keys.
  const token = meta.token as string
  const escrow = meta.escrow as string
  const creator = meta.creator as string
  const fundingGoal = (meta.fundingGoal as bigint).toString()
  const deadline = Number(meta.deadline as bigint)
  const goalReached = Boolean(meta.goalReached)
  const finalized = Boolean(meta.finalized)

  const status = finalized ? (goalReached ? 'FUNDED' : 'FAILED') : 'ACTIVE'

  return {
    id: projectId,
    token_address: token,
    escrow_address: escrow,
    creator,
    funding_goal: fundingGoal,
    total_raised: null,
    deadline,
    status,
  }
}
