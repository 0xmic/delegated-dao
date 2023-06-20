import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

// Components used in Routes
import Navigation from './Navigation';
import Tabs from './Tabs';
import Propose from './Propose';
import Delegate from './Delegate';
import Delegatees from './Delegatees';
import Vote from './Vote';
import History from './History';

import {
  loadAccount,
  loadNetwork,
  loadProvider,
  loadToken,
  loadDelegatedDAO
} from '../store/interactions'

function App() {
  // Fetch the dispatch function from Redux to allow dispatching actions to the store.
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Initiate Ethereum provider to interact with the Ethereum blockchain
    const provider = await loadProvider(dispatch)

    // Fetch current network's chainId (Ethereum network ID)
    const chainId = await loadNetwork(provider, dispatch)

    // Listener to handle network changes. Reload the page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Listener to handle account changes. Reload the page when the user changes their account in Metamask
    window.ethereum.on('accountsChanged', async (accounts) => {
      // Fetch the current account from Metamask
      await loadAccount(dispatch)
      // Reload the page to reflect account change
      window.location.reload()
    })

    // Fetch token contract
    await loadToken(provider, chainId, dispatch)

    // Fetch DAO contract
    await loadDelegatedDAO(provider, chainId, dispatch)
  }

  // Use useEffect to run loadBlockchainData function once after the component is mounted
  useEffect(() => {
    loadBlockchainData()
  }, []);

  return(
      // Wrap everything inside a Bootstrap Container for center alignment and padding
    <Container>
      {/* Use HashRouter for routing */}
      <HashRouter>

        <Navigation />

        <hr />

        <Tabs />

        {/* Define Routes for each component */}
        <Routes>
          <Route exact path="/" element={<Propose />} />
          <Route exact path="/delegate" element={<Delegate />} />
          <Route exact path="/delegatees" element={<Delegatees />} />
          <Route exact path="/vote" element={<Vote />} />
          <Route exact path="/history" element={<History />} />

        </Routes>

      </HashRouter>

    </Container>
  )
}

export default App;
