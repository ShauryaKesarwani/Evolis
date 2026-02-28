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
  const meta = await factory.getDeployment(projectId)

  // Ethers v6 structs come back as both array + named keys.
  const token = meta.token as string
  const controller = meta.controller as string
  const pool = meta.pool as string
  const owner = meta.owner as string
  const totalSupply = (meta.totalSupply as bigint).toString()
  const timestamp = Number(meta.timestamp as bigint)

  return {
    id: projectId,
    name: null,
    tagline: null,
    logo_url: null,
    website_url: null,
    symbol: null,
    category: null,
    token_address: token,
    escrow_address: pool || controller, // Use pool address if available, fallback to controller
    controller_address: controller,
    creator: owner,
    funding_goal: totalSupply, // placeholder: no funding goal in current contract
    total_raised: null,
    deadline: timestamp, // using deployment timestamp; no deadline in current contract
    status: 'ACTIVE',
  }
}
