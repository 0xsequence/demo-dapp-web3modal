import { Box, Image, Text } from '@0xsequence/design-system'
import React, { useState, useEffect } from 'react'

import logoUrl from './images/logo.svg'

import { ethers } from 'ethers'
import { sequence } from '0xsequence'

import Web3Modal from '@0xsequence/web3modal'
import WalletConnect from '@walletconnect/web3-provider'

import { ERC_20_ABI } from './constants/abi'

import { configureLogger } from '@0xsequence/utils'
import { Group } from './components/Group'
import { Button } from './components/Button'
import { Console } from './components/Console'

configureLogger({ logLevel: 'DEBUG' })

let providerOptions: any = {
  walletconnect: {
    package: WalletConnect,
    options: {
      infuraId: 'xxx-your-infura-id-here'
    }
  }
}

let sequenceWallet: sequence.Wallet | undefined
let sequenceConnectDetails: sequence.provider.ConnectDetails | undefined

if (!window?.ethereum?.isSequence) {
  providerOptions = {
    ...providerOptions,
    sequence: {
      package: sequence,
      options: {
        appName: 'Web3Modal Demo Dapp',
        defaultNetwork: 'polygon',

        // onConnect is an optional callback which will be triggered whenever
        // web3modal connects the Sequence wallet. In connectDetails you will find
        // the useful `connectDetails.proof` which gives you a signed message upon connect.
        onConnect: (connectDetails: sequence.provider.ConnectDetails) => {
          console.log('got the connect details here..', connectDetails)
          sequenceConnectDetails = connectDetails
        },

        // getSequenceWallet is an optional callback which will be triggered whenever
        // web3modal initializes a Sequence wallet. This will happen each time on
        // a browser reload. It's useful in case when you want to make Sequence-specific
        // calls, such as a batched transaction.
        getSequenceWallet: (wallet: sequence.Wallet) => {
          console.log('got the wallet here..', sequenceWallet)
          sequenceWallet = wallet
        },

        // keepWalletOpened is an optional flag which will keep the Sequence wallet
        // opened after a connection. You will be responsible to close the wallet
        // window on your own with `sequenceWallet.close()` call. This is useful
        // at times if you want to send a bunch of operations to the wallet
        // without having to open and close it. In more cases, you won't need this,
        // but it is here for flexibility.
        //
        // keepWalletOpened: true,
      }
    }
  }
}

const web3Modal = new Web3Modal({
  providerOptions,
  cacheProvider: true
})

const App = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [consoleMsg, setConsoleMsg] = useState<null|string>(null)
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false)

  useEffect(() => {
    consoleWelcomeMessage()
  }, [])

  // Uncomment to enable automatically connecting to the cached Provider
  // Might cause a popup to appear on start in some cases
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet()
    }
  // eslint-disable-next-line
  }, [])

  const connectWallet = async () => {
    const wallet = await web3Modal.connect()

    const provider = new ethers.providers.Web3Provider(wallet)

    if (sequenceConnectDetails) {
      console.log('Sequence wallet has been connected. connectDetails:', sequenceConnectDetails)
    }

    setProvider(provider)
    addNewConsoleLine('Wallet connected!')
  }

  const connectWeb3Modal = async () => {
    if (web3Modal.cachedProvider) {
      web3Modal.clearCachedProvider()
    }
    connectWallet()
  }

  const disconnectWeb3Modal = async () => {
    web3Modal.clearCachedProvider()

    // disconnect the sequence wallet if previously had been initialized
    sequenceWallet?.disconnect()

    setProvider(null)
    consoleWelcomeMessage()
  }

  const getChainID = async () => {
    try {
      resetConsole()
      const signer = provider!.getSigner()
      const chainId = await signer.getChainId()
      console.log('signer.getChainId()', chainId)
      addNewConsoleLine(`signer.getChainId(): ${chainId}`)
      setConsoleLoading(false)
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const getAccounts = async () => {
    try {
      resetConsole()
      const signer = provider!.getSigner()
      const address = await signer.getAddress()
      console.log('getAddress():', address)
      addNewConsoleLine(`getAddress(): ${address}`)
      const accounts = await provider!.listAccounts()
      console.log('accounts:', accounts)
      appendConsoleLine(`accounts: ${JSON.stringify(accounts)}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const getBalance = async () => {
    try {
      resetConsole()
      const signer = provider!.getSigner()
      const account = await signer.getAddress()
      const balanceChk1 = await provider!.getBalance(account)
      console.log('balance check 1', balanceChk1.toString())
      addNewConsoleLine(`balance check 1: ${balanceChk1.toString()}`)
  
      const balanceChk2 = await signer.getBalance()
      console.log('balance check 2', balanceChk2.toString())
      appendConsoleLine(`balance check 2: ${balanceChk2.toString()}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const getNetworks = async () => {
    try {
      resetConsole()
      const network = await provider!.getNetwork() 
      console.log('networks:', network)
  
      addNewConsoleLine(`networks: ${JSON.stringify(network)}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const signMessage = async () => {
    try {
      resetConsole()
      const signer = await provider!.getSigner()
  
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
  
  
      // sign
      const sig = await signer.signMessage(message)
      console.log('signature:', sig)
  
      addNewConsoleLine(`signature: ${sig}`)
  
      const isValid = await sequence.utils.isValidMessageSignature(await signer.getAddress(), message, sig, provider!)
      console.log('isValid?', isValid)
  
      appendConsoleLine(`isValid? ${isValid}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const signTypedData = async () => {
    try {
      resetConsole()
      const signer = provider!.getSigner()
  
      const typedData: sequence.utils.TypedData = {
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: await signer.getChainId(),
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ]
        },
        message: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
        }
      }
  
      const sig = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)
      console.log('signature:', sig)
  
      addNewConsoleLine(`signature:  ${sig}`)
  
      const isValid = await sequence.utils.isValidTypedDataSignature(await signer.getAddress(), typedData, sig, provider!)
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
      resetConsole()
      const signer = provider!.getSigner() // select DefaultChain signer by default
  
      console.log(`Transfer txn on ${signer.getChainId()}`)
      addNewConsoleLine(`Transfer txn on ${signer.getChainId()}`)
  
      const toAddress = ethers.Wallet.createRandom().address
  
      const tx1 = {
        gasLimit: '0x55555',
        to: toAddress,
        value: ethers.utils.parseEther('1.234'),
        data: '0x'
      }
  
      const balance1 = await provider!.getBalance(toAddress)
      console.log(`balance of ${toAddress}, before:`, balance1)
      appendConsoleLine(`balance of ${toAddress}, before: ${balance1}`)
      const txnResp = await signer.sendTransaction(tx1)
      await txnResp.wait()
  
      const balance2 = await provider!.getBalance(toAddress)
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
      resetConsole()
      const signer = provider!.getSigner()
  
      const toAddress = ethers.Wallet.createRandom().address
  
      const amount = ethers.utils.parseUnits('5', 18)
  
      const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' // (DAI address on Polygon)
  
      const tx = {
        gasLimit: '0x55555',
        to: daiContractAddress,
        value: 0,
        data: new ethers.utils.Interface(ERC_20_ABI).encodeFunctionData('transfer', [toAddress, amount.toHexString()])
      }
  
      const txnResp = await signer.sendTransaction(tx)
      await txnResp.wait()
  
      console.log('transaction response', txnResp)
      addNewConsoleLine(`TX response ${JSON.stringify(txnResp)}`)
      setConsoleLoading(false) 
    } catch(e) {
      console.error(e)
      consoleErrorMesssage()
    }
  }

  const disableActions = !provider
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

  return (
    <Box marginY="0" marginX="auto" paddingX="6" style={{ maxWidth: '720px', marginTop: '80px', marginBottom: '80px' }}>
      <Box marginBottom="4">
        <Image height="10" alt="logo" src={logoUrl} />
      </Box>
      <Box>
        <Text color="text100" variant="large">Demo Dapp + Web3Modal</Text>
      </Box>
      <Box marginBottom="4">
        <Text>Please open your browser dev inspector to view output of functions below</Text>
      </Box>
      <Group label="Connection">
        <Button onClick={() => connectWeb3Modal()}>Connect Web3Modal</Button>
        <Button onClick={() => disconnectWeb3Modal()}>Disconnect</Button>
      </Group>
      <Group label="State">
        <Button disabled={disableActions} onClick={() => getChainID()}>
          ChainID
        </Button>
        <Button disabled={disableActions} onClick={() => getNetworks()}>
          Networks
        </Button>
        <Button disabled={disableActions} onClick={() => getAccounts()}>
          Get Accounts
        </Button>
        <Button disabled={disableActions} onClick={() => getBalance()}>
          Get Balance
        </Button>
      </Group>

      <Group label="Signing">
        <Button disabled={disableActions} onClick={() => signMessage()}>
          Sign Message
        </Button>
        <Button disabled={disableActions} onClick={() => signTypedData()}>
          Sign TypedData (EIP-712) Message
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

      <Console message={consoleMsg} loading={consoleLoading} />
    </Box>
  )
}

export default React.memo(App)
