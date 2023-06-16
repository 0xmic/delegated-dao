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
  proposalsLoaded,
  upVoteRequest,
  upVoteSuccess,
  upVoteFail,
  downVoteRequest,
  downVoteSuccess,
  downVoteFail,
  finalizeProposalRequest,
  finalizeProposalSuccess,
  finalizeProposalFail,
  userVotesLoaded,
  delegateesLoaded
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

    const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);

    transaction = await delegatedDAO.connect(signer).createProposal(title, description, parsedAmount, recipient)
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

    const signer = await provider.getSigner()

    let transaction = await token.connect(signer).approve(delegatedDAO.address, tokens(balance))
    let receipt = await transaction.wait()
    transaction = await delegatedDAO.connect(signer).delegate(delegate)
    receipt = await transaction.wait()

    if (receipt.status === 1) {
      dispatch(delegateSuccess(transaction.hash))
      return true
    } else {
      dispatch(delegateFail())
      return false
    }
  } catch (error) {
    dispatch(delegateFail())
    return false
  }
}

// ---------------------------------------------------------------------------------
// UNDELEGATE VOTES
export const undelegateVotes = async (provider, delegatedDAO, dispatch) => {
  try {
    dispatch(undelegateRequest())

    const signer = await provider.getSigner()
    const transaction = await delegatedDAO.connect(signer).undelegate()
    const receipt = await transaction.wait()

    if (receipt.status === 1) {
      dispatch(undelegateSuccess(transaction.hash))
      return true
    } else {
      dispatch(undelegateFail())
      return false
    }
  } catch (error) {
    dispatch(undelegateFail())
    return false
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

// ---------------------------------------------------------------------------------
// VOTING: UPVOTE, DOWNVOTE, FINALIZE
export const upVote = async (provider, delegatedDAO, id, dispatch) => {
  try {
    dispatch(upVoteRequest())

    const signer = await provider.getSigner()

    const transaction = await delegatedDAO.connect(signer).upVote(id)
    const receipt = await transaction.wait()

    if (receipt.status === 1) {
      dispatch(upVoteSuccess(transaction.hash))
      return true
    } else {
      dispatch(upVoteFail())
      return false
    }
  } catch (error) {
    dispatch(upVoteFail())
    return false
  }
}

export const downVote = async (provider, delegatedDAO, id, dispatch) => {
  try {
    dispatch(downVoteRequest())

    const signer = await provider.getSigner()

    const transaction = await delegatedDAO.connect(signer).downVote(id)
    const receipt = await transaction.wait()

    if (receipt.status === 1) {
      dispatch(downVoteSuccess(transaction.hash))
      return true
    } else {
      dispatch(downVoteFail())
      return false
    }
  } catch (error) {
    dispatch(downVoteFail())
    return false
  }
}

export const finalizeProposal = async (provider, delegatedDAO, id, dispatch) => {
  try {
    dispatch(finalizeProposalRequest())

    const signer = await provider.getSigner()

    const transaction = await delegatedDAO.connect(signer).finalizeProposal(id)
    const receipt = await transaction.wait()

    if (receipt.status === 1) {
      dispatch(finalizeProposalSuccess(transaction.hash))
      return true
    } else {
      dispatch(finalizeProposalFail())
      return false
    }
  } catch (error) {
    dispatch(finalizeProposalFail())
    return false
  }
}

// ---------------------------------------------------------------------------------
// LOAD USER VOTES
export const loadUserVotes = async (delegatedDAO, account, dispatch) => {
  let userVotes = {}

  let count = parseInt(await delegatedDAO.proposalCount())

  for (var i = 0; i < count; i++) {
    const hasVoted = ethers.utils.formatUnits(await delegatedDAO.votesCast(account, i + 1), 18)
    userVotes[i + 1] = parseInt(hasVoted)
  }

  dispatch(userVotesLoaded(userVotes))

  return userVotes
}

// ---------------------------------------------------------------------------------
// LOAD DELEGATEES
export const loadDelegatees = async (provider, delegatedDAO, dispatch) => {
  const block = await provider.getBlockNumber()

  let delegatees = {}

  // Map through delegate events
  const delegateStream = await delegatedDAO.queryFilter('Delegate', 0, block)
  for (let event of delegateStream) {
    // Extract the delegatee and the amount from the event arguments
    const { delegator, delegatee, amount } = event.args
    const formattedAmount = ethers.utils.formatUnits(amount, 18)

    // If the delegatee is not yet in the delegatees object, add them
    if (!delegatees[delegatee]) {
        delegatees[delegatee] = {
            delegatee: delegatee,
            votes: parseFloat(formattedAmount)
        }
    } else {
        // If the delegatee is already in the delegatees object, add the amount to their votes
        delegatees[delegatee].votes += parseFloat(formattedAmount)
    }
}

   // Map through undelegate events
   const undelegateStream = await delegatedDAO.queryFilter('Undelegate', 0, block)
   for (let event of undelegateStream) {
       // Extract the delegatee and the amount from the event arguments
       const { delegator, delegatee, amount } = event.args
       const formattedAmount = ethers.utils.formatUnits(amount, 18)

       // If the delegatee is in the delegatees object, subtract the amount from their votes
       if (delegatees[delegatee]) {
           delegatees[delegatee].votes -= parseFloat(formattedAmount)
           // If the delegatee's votes have become zero or less, remove them from the delegatees object
           if (delegatees[delegatee].votes <= 0) {
               delete delegatees[delegatee]
           }
       }
   }

   // Convert the delegatees object into an array of delegatee objects
   const delegateesArray = Object.values(delegatees)

   dispatch(delegateesLoaded(delegateesArray))

   return delegateesArray
}
