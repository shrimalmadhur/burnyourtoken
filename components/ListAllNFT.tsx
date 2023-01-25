import { FC, useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import React from 'react'
import { init, useConnectWallet } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { Network, Alchemy, NftTokenType } from 'alchemy-sdk'
import { TokenResponse } from '../types';
import { WalletState } from '@web3-onboard/core';
import erc721abi from '../artifacts/erc721-abi.json'
import erc1155abi from '../artifacts/erc1155-abi.json'

type Props = {
  wallet: WalletState
}


const ListAllNFT: FC<Props> = (data) => {

  const address = data.wallet.accounts[0].address;

  const chainId = data.wallet.chains[0].id;
  let chainType = "mainnet"
  if (chainId == '0x5') {
    chainType = 'goerli'
  } else if (chainId == '0x13881') {
    chainType = 'mumbai'
  } else if (chainId == '0x89') {
    chainType = 'polygon'
  }
  const defaultAtta: TokenResponse[] = []
  const [nftData, setNftData] = useState(defaultAtta)

  const burnToken = async function (token: TokenResponse) {
    // create an ethers provider
    let ethersProvider
    ethersProvider = new ethers.providers.Web3Provider(data.wallet.provider, 'any');

    const signer = ethersProvider.getSigner(data.wallet.accounts[0].address);

    // explore https://github.com/alephao/erc721-batch-transfer for batch transfer
    try {
      let nftContract;
      if (token.tokenType === NftTokenType.ERC721) {
        nftContract = new ethers.Contract(token.contractAddress, erc721abi, signer);
        const tx = await nftContract["safeTransferFrom(address,address,uint256)"](address, "0x000000000000000000000000000000000000dead", token.tokenId, { gasPrice: 20e9 })
        const receipt = await tx.wait()
      } else if (token.tokenType === NftTokenType.ERC1155) {
        nftContract = new ethers.Contract(token.contractAddress, erc1155abi, signer);
        const tx = await nftContract["safeTransferFrom(address,address,uint256,uint256,bytes)"](address, "0x000000000000000000000000000000000000dead", token.tokenId, 1, ethers.constants.HashZero, { gasPrice: 20e9 })
        const receipt = await tx.wait()
      } else {
        console.log("invalid token type: ", token.tokenType)
        return;
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    axios.get('/api/v1/' + chainType + '/nft/' + address)
      .then(response => {
        setNftData(response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }, [address, chainType])
  return (
    <div className='w-full'>
      {
        nftData
          ? <div className='w-full'>{nftData.map(element => {
            return (
              <div className='w-full space-between md:h-auto flex flex-col md:flex-row hover:bg-green-400 rounded-full'>
                <div className="w-full flex flex-row">
                  <img src={element.thumbnailUrl} className='flex w-24 h-24 p-2 rounded-full'></img>
                  <div className='flex basis-3/4 p-4'>{element.name} <span className='ml-4 text-[10px] bg-yellow-500  hover:bg-yellow-700 h-4 align-center rounded-full pl-2 pr-2 mt-1'>{element.tokenType}</span></div>
                </div>
                <button className='flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 py-2 md:px-4 mr-6 h-1/2 align-center rounded-full mt-6 mb-4 md:mb-0' onClick={() => burnToken(element)}><span className="mt-1 mx-auto">Burn</span></button>
              </div>
            )
          })}</div>
          : "No wallet connected"

      }
    </div>
  )
}

export default ListAllNFT