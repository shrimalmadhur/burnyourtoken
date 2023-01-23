import { NftTokenType, OwnedNft } from "alchemy-sdk"

export type TokenResponse  = {
  name: string,
  contractAddress: string,
  tokenId: string,
  tokenType: NftTokenType,
  thumbnailUrl?: string,
  rawImageUrl?: string
}

export type ERC20TokenResponse = {
  name: string,
  contractAddress: string,
  tokenBalance: string,
  decimals: number,
  symbol: string,
}