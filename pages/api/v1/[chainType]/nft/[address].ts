// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Alchemy, AlchemySettings } from 'alchemy-sdk'
import { TokenResponse } from '../../../../../types'

type Data = {
  names: TokenResponse[]
}

const alchemyAPIKey = process.env.NEXT_ALCHEMY_API_KEY || ""
const goerliAlchemyAPIKey = process.env.NEXT_GOERLI_ALCHEMY_API_KEY || ""
const polygonMumbaiAlchemyAPIKey = process.env.NEXT_POLYGON_MUMBAI_ALCHEMY_API_KEY || ""
const polygonMainnetAlchemyAPIKey = process.env.NEXT_POLYGON_MAINNET_ALCHEMY_API_KEY || ""

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse[]>
) {

  const settingsMap = {
    mainnet: {
      apiKey: alchemyAPIKey, // Replace with your Alchemy API Key.
      network: Network.ETH_MAINNET, // Replace with your network.
    },
    goerli: {
      apiKey: goerliAlchemyAPIKey, // Replace with your Alchemy API Key.
      network: Network.ETH_GOERLI, // Replace with your network.
    }, 
    mumbai: {
      apiKey: polygonMumbaiAlchemyAPIKey, // Replace with your Alchemy API Key.
      network: Network.MATIC_MUMBAI, // Replace with your network.
    },
    polygon: {
      apiKey: polygonMainnetAlchemyAPIKey, // Replace with your Alchemy API Key.
      network: Network.MATIC_MAINNET, // Replace with your network.
    }
  }

  if (typeof req.query.address === 'string' && typeof req.query.chainType === 'string') {
    // Optional Config object, but defaults to demo api-key and eth-mainnet.
    let settings: AlchemySettings = settingsMap.mainnet;
    const chainType = req.query.chainType;
    if (chainType === 'goerli') {
      settings = settingsMap.goerli;
    } else if (chainType === 'mumbai') {
      settings = settingsMap.mumbai
    } else if (chainType == 'polygon') {
      settings = settingsMap.polygon
    }
  
    const alchemy = new Alchemy(settings);

    const nfts = await alchemy.nft.getNftsForOwner(req.query.address);
    const ownedNFT = nfts.ownedNfts
    const nftNames: TokenResponse[] = []
    ownedNFT.forEach(element => {
      const nftData = {
        name: element.title,
        contractAddress: element.contract.address,
        tokenId: element.tokenId,
        tokenType: element.tokenType,
        thumbnailUrl: element.media[0]?.thumbnail,
        rawImageUrl: element.rawMetadata?.image
      }
      nftNames.push(nftData)
    });
    res.status(200).json(nftNames)
  } else {
    res.status(500)
  }
  
}
