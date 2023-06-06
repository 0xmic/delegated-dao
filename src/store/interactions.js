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
  setDelegatedDAOContract
} from './reducers/delegatedDAO'

import TOKEN_ABI from '../abis/Token.json'
import DELEGATEDDAO_ABI from '../abis/DelegatedDAO.json'
import config from '../config.json'

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

  dispatch(balanceLoaded(balance))
}
