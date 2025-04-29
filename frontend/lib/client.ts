import { createPublicClient, http } from 'viem'
import { rootstockTestnet } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http()
})