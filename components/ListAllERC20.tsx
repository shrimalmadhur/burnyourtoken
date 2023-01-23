import { FC, useContext, useEffect, useRef, useState, Fragment } from 'react';
import axios from "axios";
import React from 'react'
import { init, useConnectWallet } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { Network, Alchemy, NftTokenType } from 'alchemy-sdk'
import { TokenResponse, ERC20TokenResponse } from '../types';
import { WalletState } from '@web3-onboard/core';
import erc20abi from '../artifacts/erc20-abi.json'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

type Props = {
  wallet: WalletState
}


const ListAllERC20: FC<Props> = (data) => {

  const [open, setOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState<ERC20TokenResponse | null>(null);
  const [tokenName, setTokenName] = useState<string | undefined>("");
  const [burnValue, setBurnValue] = useState<number>(0)

  const handleOpen = (token: ERC20TokenResponse | null) => {
    if (token == null) {
      setOpen(!open);
      setCurrentToken(null)
      setTokenName("")
      setBurnValue(0)
    } else {
      setOpen(!open);
      setCurrentToken(token)
      setTokenName(token?.name)
    }
  }

  const address = data.wallet.accounts[0].address;

  const chainId = data.wallet.chains[0].id;
  let chainType = "mainnet"
  if (chainId == '0x5') {
    chainType = 'goerli'
  }
  const defaultAtta: ERC20TokenResponse[] = []
  const [tokenData, setTokenData] = useState(defaultAtta)

  const burnToken = async function () {
    // create an ethers provider
    const token = currentToken
    let ethersProvider
    ethersProvider = new ethers.providers.Web3Provider(data.wallet.provider, 'any');

    const signer = ethersProvider.getSigner(data.wallet.accounts[0].address);


    if (token != null) {
      try {
        const someVal = burnValue * (10 ** token.decimals)
        const valueToBurn = ethers.BigNumber.from(someVal.toString())
        const tokenContract = new ethers.Contract(token.contractAddress, erc20abi, signer);

        // approve
        let tx = await tokenContract.approve(token.contractAddress, valueToBurn);
        let receipt = await tx.wait();
        
        // transfer
        tx = await tokenContract.transferFrom(address, "0x000000000000000000000000000000000000dead", valueToBurn);
        receipt = await tx.wait();

        setOpen(!open);
      } catch (error) {
        console.log(error)
      }
    }
  }

  const parseBalance = function (tokenBalance: string, decimal: number) {
    const intValue = parseInt(tokenBalance || "0", 16);
    return intValue / 10 ** decimal
  }

  useEffect(() => {
    axios.get('/api/v1/' + chainType + '/erc20/' + address)
      .then(response => {
        setTokenData(response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }, [address, chainType])
  return (
    <div className='w-full'>
      {
        tokenData
          ? <div className='w-full'>{tokenData.map(element => {
            return (
              <div className='w-full space-between md:h-auto flex flex-col md:flex-row hover:bg-green-400 rounded-full'>
                <div className="w-full flex flex-row">
                  {/* <img src={element.thumbnailUrl} className='flex w-24 h-24 p-2 rounded-full'></img> */}
                  <div className='flex basis-3/4 p-4'>{element.name} ({element.symbol})
                    <span className='ml-4 text-[10px] bg-yellow-500  hover:bg-yellow-700 h-4 align-center rounded-full pl-2 pr-2 mt-1'>{parseBalance(element.tokenBalance, element.decimals)}</span>
                  </div>
                </div>
                <button className='flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 py-2 md:px-4 mr-6 h-1/2 align-center rounded-full mt-6 mb-4 md:mb-0' onClick={() => handleOpen(element)}><span className="mt-1 mx-auto">Burn</span></button>
              </div>
            )
          })}</div>
          : "No wallet connected"
      }
      <Fragment>
        <Dialog open={open} handler={handleOpen}>
          <DialogHeader>{tokenName}</DialogHeader>
          <DialogBody divider>
            <span>Max: {currentToken ? parseBalance(currentToken.tokenBalance, currentToken.decimals) : 0}</span>
            <input
              type="number"
              defaultValue="0"
              onChange={(e) => setBurnValue(parseFloat(e.target.value))}
              className='flex bg-grey-500 hover:bg-grey-700 text-black py-1 px-1 py-2 md:px-4 mr-6 h-1/2 align-center rounded-full mt-6 mb-4 md:mb-0'
            />
            {/* </input> */}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={() => handleOpen(null)}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="green" onClick={() => burnToken()}>
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </Fragment>
    </div>
  )
}

export default ListAllERC20