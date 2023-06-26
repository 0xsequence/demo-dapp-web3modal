import { useWeb3Modal } from '@web3modal/react'
import { Box, Image, Text } from '@0xsequence/design-system'
import React, { useState, useEffect } from 'react'

import logoUrl from './images/logo.svg'

import { ethers } from 'ethers'
import { Address, formatEther, parseEther } from 'viem'
import { useWalletClient, usePublicClient, useAccount, useConnect, useDisconnect } from 'wagmi'

import { ERC_20_ABI } from './constants/abi'

import { configureLogger } from '@0xsequence/utils'
import { Group } from './components/Group'
import { Button } from './components/Button'
import { Console } from './components/Console'

configureLogger({ logLevel: 'DEBUG' })

const App = () => {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { isLoading } = useConnect()
  const { disconnect } =  useDisconnect()

  const [consoleMsg, setConsoleMsg] = useState<null|string>(null)
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false)

  const appendConsoleLine = (message: string) => {
    return (setConsoleMsg((prevState => {
      return `${prevState}\n\n${message}`
    })))
  }
  
  const resetConsole = () => {
    setConsoleMsg(null)
    setConsoleLoading(true)
  }

  const addNewConsoleLine = (message: string) => {
    setConsoleMsg((() => {
      return (message)
    }))
  }

  const consoleWelcomeMessage = () => {
    setConsoleLoading(false)
    setConsoleMsg('Status: Wallet not connected. Please connect wallet to use Methods')
  }

  const consoleErrorMesssage = () => {
    setConsoleLoading(false)
    setConsoleMsg('An error occurred')
  }

  useEffect(() => {
    if (isConnected) {
      setConsoleMsg('Wallet connected!')
    } else {
      consoleWelcomeMessage()
    }
  }, [isConnected])

  const getChainID = async () => {
    try {
      if (!walletClient) {
        throw  new Error('Wallet not connected')
      }

      resetConsole()
      const chainId = await walletClient.getChainId()
      console.log('walletClient.getChainId()', chainId)
      addNewConsoleLine(`walletClient.getChainId(): ${chainId}`)
      setConsoleLoading(false)
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const getBalance = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }
      resetConsole()
      const [account] = await walletClient.getAddresses()
      const balance = await publicClient.getBalance({
        address: account,
      })
      const formattedBalance = formatEther(balance)
      console.log('balance', formattedBalance)
      addNewConsoleLine(`balance: ${formattedBalance}`)
  
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }


  const getNetwork = async () => {
    try {
      resetConsole()
      const network = publicClient.chain
      console.log('network:', network)
  
      addNewConsoleLine(`network: ${JSON.stringify(network)}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const signMessage = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }
      resetConsole()  
      const message = `Two roads diverged in a yellow wood,
  Robert Frost poet
  
  And sorry I could not travel both
  And be one traveler, long I stood
  And looked down one as far as I could
  To where it bent in the undergrowth;
  
  Then took the other, as just as fair,
  And having perhaps the better claim,
  Because it was grassy and wanted wear;
  Though as for that the passing there
  Had worn them really about the same,
  
  And both that morning equally lay
  In leaves no step had trodden black.
  Oh, I kept the first for another day!
  Yet knowing how way leads on to way,
  I doubted if I should ever come back.
  
  I shall be telling this with a sigh
  Somewhere ages and ages hence:
  Two roads diverged in a wood, and I—
  I took the one less traveled by,
  And that has made all the difference.`
      
  
      const [account] = await walletClient.getAddresses()
  
      // sign
      const sig = await walletClient.signMessage({
        message,
        account
      })
      console.log('signature:', sig)
  
      addNewConsoleLine(`signature: ${sig}`)

      const isValid = await publicClient.verifyMessage({
        address: account,
        message,
        signature: sig
      })

      console.log('isValid?', isValid)
  
      appendConsoleLine(`isValid? ${isValid}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const sendETH = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }
      resetConsole()
  
      console.log(`Transfer txn on ${walletClient.getChainId()}`)
      addNewConsoleLine(`Transfer txn on ${walletClient.getChainId()}`)
  
      const toAddress = ethers.Wallet.createRandom().address
  
      const balance1 = await publicClient.getBalance({
        address: toAddress as Address
      })
      console.log(`balance of ${toAddress}, before:`, balance1)
      appendConsoleLine(`balance of ${toAddress}, before: ${balance1}`)
      
      const [account] = await walletClient.getAddresses()

      /* @ts-ignore-next-line */
      await walletClient.sendTransaction({
        to: toAddress as Address,
        value: parseEther('1.00'),
        account,
      })

      const balance2 = await publicClient.getBalance({
        address: toAddress as Address
      })
      console.log(`balance of ${toAddress}, after:`, balance2)
      appendConsoleLine(`balance of ${toAddress}, after: ${balance2}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const sendDAI = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }
      resetConsole()
      const toAddress = ethers.Wallet.createRandom().address
  
      const amount = ethers.utils.parseUnits('5', 18)
  
      const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' // (DAI address on Polygon)

      const [account] = await walletClient.getAddresses()

      /* @ts-ignore-next-line */
      const hash = await walletClient.sendTransaction({
        account,
        to: daiContractAddress,
        value: BigInt(0),
        data: new ethers.utils.Interface(ERC_20_ABI).encodeFunctionData('transfer', [toAddress, amount.toHexString()]) as `0x${string}`
      })
  
      console.log('transaction response', hash)
      addNewConsoleLine(`TX response ${hash}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const disableActions = !isConnected

  const getWalletActions = () => {
    if (!isConnected) {
      return null
    }
    return (
      <>
        <Box marginBottom="4">
          <Text>Please open your browser dev inspector to view output of functions below</Text>
        </Box>
        <Group label="State">
          <Button disabled={disableActions} onClick={() => getChainID()}>
            ChainID
          </Button>
          <Button disabled={disableActions} onClick={() => getNetwork()}>
            Network
          </Button>
          <Button disabled={disableActions} onClick={() => getBalance()}>
            Get Balance
          </Button>
        </Group>

        <Group label="Signing">
          <Button disabled={disableActions} onClick={() => signMessage()}>
            Sign Message
          </Button>
        </Group>

        <Group label="Transactions">
          <Button disabled={disableActions} onClick={() => sendETH()}>
            Send ETH
          </Button>
          <Button disabled={disableActions} onClick={() => sendDAI()}>
            Send DAI Tokens
          </Button>
        </Group>
        </>
    )
  }

  const getConnectionButtons = () => {
    if (!isConnected) {
      return (
        <Box gap="4" flexDirection="column" marginY="4">
          <Button
            disabled={isLoading}
            onClick={() => open()}
          >
            Connect
          </Button>
        </Box>
      )
    }

    return (
      <Group>
        <Button onClick={() => disconnect()}>
          Disconnect Wallet
        </Button>
      </Group>
    )
  }

  return (
    <Box marginY="0" marginX="auto" paddingX="6" style={{ maxWidth: '720px', marginTop: '80px', marginBottom: '80px' }}>
      <Box marginBottom="4">
        <Image height="10" alt="logo" src={logoUrl} />
      </Box>
      <Box>
        <Text color="text100" variant="large">Demo Dapp + Wagmi</Text>
      </Box>
      {getConnectionButtons()}
      {getWalletActions()}
      <Console message={consoleMsg} loading={consoleLoading} />
    </Box>
  )
}

export default React.memo(App)

