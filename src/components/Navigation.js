import { useSelector, useDispatch } from 'react-redux'
import Navbar from 'react-bootstrap/Navbar'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Blockies from 'react-blockies'

import logo from '../logo.png'

import {
  loadAccount,
  loadBalance,
  loadDAOBalance,
  loadDelegatorDelegatee,
  loadDelegatorBalance,
  loadDelegateeVotesReceived,
  loadVotingPeriodHours,
  loadQuorum,
  loadProposals,
  loadUserVotes,
  loadDelegatees
} from '../store/interactions'

import config from '../config.json'

const Navigation = () => {
  const chainId = useSelector(state => state.provider.chainId)
  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)
  const token = useSelector(state => state.token.contract)
  const delegatedDAO = useSelector(state => state.delegatedDAO.contract)

  const dispatch = useDispatch()

  const connectHandler = async () => {
    const account = await loadAccount(dispatch)
    const balance = await loadBalance(token, account, dispatch)
    const daoBalance = await loadDAOBalance(token, delegatedDAO, delegatedDAO.address, dispatch)
    const delegatorDelegatee = await loadDelegatorDelegatee(delegatedDAO, account, dispatch)
    const delegatorBalance = await loadDelegatorBalance(delegatedDAO, account, dispatch)
    const delegateeVotesReceived = await loadDelegateeVotesReceived(delegatedDAO, account, dispatch)
    const votingPeriodHours = await loadVotingPeriodHours(delegatedDAO, dispatch)
    const quorum = await loadQuorum(delegatedDAO, dispatch)
    const proposals = await loadProposals(delegatedDAO, dispatch)
    const userVotes = await loadUserVotes(delegatedDAO, account, dispatch)
    const delegatees = await loadDelegatees(provider, delegatedDAO, dispatch)
  }

  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }]
    })
  }

  return (
    <Navbar className='my-3' expand='lg'>
      <img alt='logo' src={logo} width='40' height='40' className='d-inline-block align-top mx-3' />

      <Navbar.Brand href='#'>Crypto Token (CT) Delegated DAO</Navbar.Brand>

      <Navbar.Toggle aria-controls="nav" />
      <Navbar.Collapse id='nav' className='justify-content-end'>

        <div className="d-flex justify-content-end mt-3">

          <Form.Select
            aria-label="Network Selector"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
            style={{ maxWidth: '200px', marginRight: '20px' }}
          >
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
          </Form.Select>

          {account ? (
            <Navbar.Text className="d-flex align-items-center">
              {account.slice(0, 5) + '...' + account.slice(-4)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color='#e6e6e6'
                bgColor='#000000'
                spotColor='#ffffff'
                className="identicon mx-2"
              />
            </Navbar.Text>
          ) : (
            <Button onClick={connectHandler}>Connect</Button>
          )}

        </div>

      </Navbar.Collapse>
    </Navbar>
  )
}

export default Navigation
