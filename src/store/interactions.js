import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setTokenContract,
  setSymbol,
  balanceLoaded,
  daoBalanceLoaded
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
  undelegateFail,
  votingPeriodHoursLoaded,
  quorumLoaded,
  proposalsLoaded
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
// LOAD BALANCES
export const loadBalance = async (token, account, dispatch) => {
  const balance = await token.balanceOf(account)

  // Convert the BigNumber balance to a string only after all calculations have been performed.
  const balanceFormatted = ethers.utils.formatUnits(balance, 18)

  // Parse the number and round to nearest whole number to avoid decimals, then convert it back to a string.
  const balanceWithoutDecimals = Math.round(parseFloat(balanceFormatted)).toString()

  dispatch(balanceLoaded(balanceWithoutDecimals))
}

export const loadDAOBalance = async (token, delegatedDAO, account, dispatch) => {
  const daoBalance = await token.balanceOf(account);
  const totalTokensDelegated = await delegatedDAO.totalTokensDelegated();

  // Subtract the total tokens delegated from the DAO balance
  const daoBalanceWithoutDelegations = daoBalance.sub(totalTokensDelegated);

  // Convert the BigNumber balance to a string only after all calculations have been performed.
  const daoBalanceFormatted = ethers.utils.formatUnits(daoBalanceWithoutDelegations, 18);

  // Parse the number and round to nearest whole number to avoid decimals, then convert it back to a string.
  const daoBalanceWithoutDecimals = Math.round(parseFloat(daoBalanceFormatted)).toString();

  dispatch(daoBalanceLoaded(daoBalanceWithoutDecimals));
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
    dispatch(delegateRequest())

    let transaction

    const signer = await provider.getSigner()

    transaction = await token.connect(signer).approve(delegatedDAO.address, tokens(balance))
    await transaction.wait()

    transaction = await delegatedDAO.connect(signer).delegate(delegate)
    await transaction.wait()

    dispatch(delegateSuccess(transaction.hash))

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

// ---------------------------------------------------------------------------------
// LOAD DAO VOTING PERIOD HOURS
export const loadVotingPeriodHours = async (delegatedDAO, dispatch) => {
  const votingPeriodHours = await delegatedDAO.votingPeriodHours()

  dispatch(votingPeriodHoursLoaded(votingPeriodHours.toNumber()))

  return votingPeriodHours
}

// ---------------------------------------------------------------------------------
// LOAD DAO QUORUM
export const loadQuorum = async (delegatedDAO, dispatch) => {
  const quorum = await delegatedDAO.quorum()

  // Assumes token has 18 decimal places
  const quorumFormatted = ethers.utils.formatUnits(quorum, 18)

  // Parse the number, floor it to remove decimals, then convert it back to a string.
  const quorumWithoutDecimals = Math.floor(parseFloat(quorumFormatted)).toString()

  dispatch(quorumLoaded(quorumWithoutDecimals))

  return quorum
}

// ---------------------------------------------------------------------------------
// LOAD PROPOSALS
export const loadProposals = async (delegatedDAO, dispatch) => {
  const proposalCountBN = await delegatedDAO.proposalCount()
  const proposalCount = proposalCountBN.toNumber()

  let proposals = []

  for (var i = 1; i <= proposalCount; i++) {
    const proposal = await delegatedDAO.proposals(i)
    proposals.push(proposal)
  }

  dispatch(proposalsLoaded(proposals))

  return proposals
}