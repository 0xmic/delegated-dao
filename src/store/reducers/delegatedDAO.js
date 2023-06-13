import { createSlice } from '@reduxjs/toolkit';

export const delegatedDAO = createSlice({
  name: 'delegatedDAO',
  initialState: {
    contract: null,
    delegatorDelegatee: '',
    delegatorBalance: 0,
    delegateeVotesReceived: 0,
    proposing: {
      isProposing: false,
      isSuccess: false,
      transactionHash: null
    }
  },
  reducers: {
    setDelegatedDAOContract: (state, action) => {
      state.contract = action.payload
    },
    delegatorDelegateeLoaded: (state, action) => {
      state.delegatorDelegatee = action.payload
    },
    delegatorBalanceLoaded: (state, action) => {
      state.delegatorBalance = action.payload
    },
    delegateeVotesReceivedLoaded: (state, action) => {
      state.delegateeVotesReceived = action.payload
    },
    proposeRequest: (state, action) => {
      state.proposing.isProposing = true
      state.proposing.isSuccess = false
      state.proposing.transactionHash = null
    },
    proposeSuccess: (state, action) => {
      state.proposing.isProposing = false
      state.proposing.isSuccess = true
      state.proposing.transactionHash = action.payload
    },
    proposeFail: (state, action) => {
      state.proposing.isProposing = false
      state.proposing.isSuccess = false
      state.proposing.transactionHash = null
    }
  }
})

export const {
  setDelegatedDAOContract,
  delegatorDelegateeLoaded,
  delegatorBalanceLoaded,
  delegateeVotesReceivedLoaded,
  proposeRequest,
  proposeSuccess,
  proposeFail
} = delegatedDAO.actions;

export default delegatedDAO.reducer;