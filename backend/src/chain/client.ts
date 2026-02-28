import { Contract, JsonRpcProvider, Wallet } from 'ethers'
import { getEnv } from '../config'
import { escrowAbi, factoryAbi } from './abis'

export function getProvider() {
  const env = getEnv()
  if (!env.RPC_URL) {
    throw new Error(
      `RPC_URL is required (cwd=${process.cwd()}). ` +
        `Ensure you have backend/.env with RPC_URL=... and you started the backend using the backend entrypoint.`,
    )
  }
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
  const poolAddress = await factory.getPool(projectId)

  // Query the pool contract for details
  const poolAbi = [
    'function projectToken() view returns (address)',
    'function projectOwner() view returns (address)',
    'function controller() view returns (address)',
    'function fundingGoal() view returns (uint256)',
    'function deadline() view returns (uint256)',
    'function totalRaised() view returns (uint256)',
    'function goalReached() view returns (bool)',
  ]
  
  const pool = new Contract(poolAddress, poolAbi, getProvider())
  
  const [token, owner, controller, fundingGoal, deadline, totalRaised, goalReached] = await Promise.all([
    pool.projectToken(),
    pool.projectOwner(),
    pool.controller(),
    pool.fundingGoal(),
    pool.deadline(),
    pool.totalRaised(),
    pool.goalReached(),
  ])

  return {
    id: projectId,
    name: null,
    tagline: null,
    logo_url: null,
    website_url: null,
    symbol: null,
    category: null,
    token_address: token as string,
    escrow_address: poolAddress, // EvolisPool IS the escrow
    controller_address: controller as string,
    creator: owner as string,
    funding_goal: (fundingGoal as bigint).toString(),
    total_raised: (totalRaised as bigint).toString(),
    deadline: Number(deadline as bigint),
    status: goalReached ? 'FUNDED' : 'ACTIVE',
  }
}
