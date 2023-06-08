import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Propose from './Propose';
import Delegate from './Delegate';
import Vote from './Vote';
import Finalized from './Finalized';

import {
  loadAccount,
  loadNetwork,
  loadProvider,
  loadToken,
  loadDelegatedDAO
} from '../store/interactions'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = await loadProvider(dispatch)

    // Fetch current network's chainId (e.g. hardhat = 31337, mainnet = 1, sepolia = 11155111)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch current account from Metamask when changed
    window.ethereum.on('accountsChanged', async (accounts) => {
      await loadAccount(dispatch)
    })

    // Fetch token contract
    await loadToken(provider, chainId, dispatch)

    // Fetch DAO contract
    await loadDelegatedDAO(provider, chainId, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  }, []);

  return(
    <Container>
      <HashRouter>
        <Navigation />

        <hr />

        <Tabs />

        <Routes>
          <Route exact path="/" element={<Propose />} />
          <Route exact path="/delegate" element={<Delegate />} />
          <Route exact path="/vote" element={<Vote />} />
          <Route exact path="/finalized" element={<Finalized />} />

        </Routes>

      </HashRouter>

    </Container>
  )
}

export default App;
