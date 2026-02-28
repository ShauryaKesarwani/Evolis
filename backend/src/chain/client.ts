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
  const meta = await factory.getDeployment(projectId)

  // Ethers v6 structs come back as both array + named keys.
  const token = meta.token as string
  const controller = meta.controller as string
  const owner = meta.owner as string
  const totalSupply = (meta.totalSupply as bigint).toString()
  const timestamp = Number(meta.timestamp as bigint)

  return {
    id: projectId,
    name: null,
    token_address: token,
    escrow_address: controller, // controller mapped to escrow_address column for now
    controller_address: controller,
    creator: owner,
    funding_goal: totalSupply, // placeholder: no funding goal in current contract
    total_raised: null, // Always null: current contracts have no contribution/funding mechanism. Needs MilestoneEscrow.
    deadline: timestamp, // using deployment timestamp; no deadline in current contract
    status: 'ACTIVE',
  }
}
