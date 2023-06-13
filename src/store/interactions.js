import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setTokenContract,
  setSymbol,
  balanceLoaded
} from './reducers/token'

import {
  setDelegatedDAOContract,
  delegatorDelegateeLoaded,
  delegatorBalanceLoaded,
  delegateeVotesReceivedLoaded,
  proposeRequest,
  proposeSuccess,
  proposeFail,
  delegateRequest,
  delegateSuccess,
  delegateFail,
  undelegateRequest,
  undelegateSuccess,
  undelegateFail
} from './reducers/delegatedDAO'

import TOKEN_ABI from '../abis/Token.json'
import DELEGATEDDAO_ABI from '../abis/DelegatedDAO.json'
import config from '../config.json'

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  dispatch(setProvider(provider))

  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId))

  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

// ---------------------------------------------------------------------------------
// LOAD CONTRACTS

export const loadToken = async (provider, chainId, dispatch) => {
  const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)

  dispatch(setTokenContract(token))
  dispatch(setSymbol(await token.symbol()))
}

export const loadDelegatedDAO = async (provider, chainId, dispatch) => {
  const delegatedDAO = new ethers.Contract(config[chainId].delegatedDAO.address, DELEGATEDDAO_ABI, provider)

  dispatch(setDelegatedDAOContract(delegatedDAO))

  return delegatedDAO
}

// ---------------------------------------------------------------------------------
// LOAD BALANCE
export const loadBalance = async (token, account, dispatch) => {
  const balance = await token.balanceOf(account)

  dispatch(balanceLoaded(ethers.utils.formatUnits(balance.toString(), 'ether')))
}

// ---------------------------------------------------------------------------------
// LOAD DELEGATOR DELEGATEE
export const loadDelegatorDelegatee = async (delegatedDAO, account, dispatch) => {
  const delegatorDelegatee = await delegatedDAO.delegatorDelegatee(account)

  dispatch(delegatorDelegateeLoaded(delegatorDelegatee))

  return delegatorDelegatee
}

// ---------------------------------------------------------------------------------
// LOAD DELEGATOR BALANCE
export const loadDelegatorBalance = async (delegatedDAO, account, dispatch) => {
  const delegatorBalance = await delegatedDAO.delegatorBalance(account)

  dispatch(delegatorBalanceLoaded(ethers.utils.formatUnits(delegatorBalance.toString(), 'ether')))

  return delegatorBalance
}

// ---------------------------------------------------------------------------------
// LOAD DELEGATEE VOTES RECEIVED
export const loadDelegateeVotesReceived = async (delegatedDAO, account, dispatch) => {
  const delegateeVotesReceived = await delegatedDAO.delegateeVotesReceived(account)

  dispatch(delegateeVotesReceivedLoaded(ethers.utils.formatUnits(delegateeVotesReceived.toString(), 'ether')))

  return delegateeVotesReceived
}

// ---------------------------------------------------------------------------------
// CREATE PROPOSAL
export const createProposal = async (provider, delegatedDAO, title, description, amount, recipient, dispatch) => {
  try {
    dispatch(proposeRequest())

    let transaction

    const signer = await provider.getSigner()

    transaction = await delegatedDAO.connect(signer).createProposal(title, description, amount, recipient)
    await transaction.wait()

    dispatch(proposeSuccess(transaction.hash))

  } catch (error) {
    dispatch(proposeFail())
  }
}

// ---------------------------------------------------------------------------------
// DELEGATE VOTES
export const delegateVotes = async (provider, token, balance, delegatedDAO, delegate, dispatch) => {
  try {
    console.log('there was an attempt')
    dispatch(delegateRequest())
    console.log('2')

    let transaction

    const signer = await provider.getSigner()

    // console.log(`balance: ${balance}`)
    // console.log(`typeof balance: ${typeof(balance)}`)
    // console.log(`tokens(balance): ${tokens(balance)}`)
    console.log('2.5')
    transaction = await token.connect(signer).approve(delegatedDAO.address, tokens(balance))
    await transaction.wait()

    transaction = await delegatedDAO.connect(signer).delegate(delegate)
    await transaction.wait()

    console.log('3')
    dispatch(delegateSuccess(transaction.hash))
    console.log('4')

  } catch (error) {
    dispatch(delegateFail())
  }
}

// ---------------------------------------------------------------------------------
// UNDELEGATE VOTES
export const undelegateVotes = async (provider, delegatedDAO, dispatch) => {
  try {
    dispatch(undelegateRequest())

    let transaction

    const signer = await provider.getSigner()

    transaction = await delegatedDAO.connect(signer).undelegate()
    await transaction.wait()

    dispatch(undelegateSuccess(transaction.hash))

  } catch (error) {
    dispatch(undelegateFail())
  }
}
