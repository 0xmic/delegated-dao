import { createSlice } from '@reduxjs/toolkit';

export const delegatedDAO = createSlice({
  name: 'delegatedDAO',
  initialState: {
    contract: null,
    delegatorDelegatee: '',
    delegatorBalance: 0,
    votingPeriodHours: 0,
    quorum: 0,
    proposals: [],
    delegateeVotesReceived: 0,
    proposing: {
      isProposing: false,
      isSuccess: false,
      transactionHash: null
    },
    delegating: {
      isDelegating: false,
      isSuccess: false,
      transactionHash: null
    },
    undelegating: {
      isUndelegating: false,
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
    votingPeriodHoursLoaded: (state, action) => {
      state.votingPeriodHours = action.payload
    },
    quorumLoaded: (state, action) => {
      state.quorum = action.payload
    },
    proposalsLoaded: (state, action) => {
      state.proposals = action.payload
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
    },
    delegateRequest: (state, action) => {
      state.delegating.isDelegating = true
      state.delegating.isSuccess = false
      state.delegating.transactionHash = null
    },
    delegateSuccess: (state, action) => {
      state.delegating.isDelegating = false
      state.delegating.isSuccess = true
      state.delegating.transactionHash = action.payload
    },
    delegateFail: (state, action) => {
      state.delegating.isDelegating = false
      state.delegating.isSuccess = false
      state.delegating.transactionHash = null
    },
    undelegateRequest: (state, action) => {
      state.undelegating.isUndelegating = true
      state.undelegating.isSuccess = false
      state.undelegating.transactionHash = null
    },
    undelegateSuccess: (state, action) => {
      state.undelegating.isUndelegating = false
      state.undelegating.isSuccess = true
      state.undelegating.transactionHash = action.payload
    },
    undelegateFail: (state, action) => {
      state.undelegating.isUndelegating = false
      state.undelegating.isSuccess = false
      state.undelegating.transactionHash = null
    }
  }
})

export const {
  setDelegatedDAOContract,
  delegatorDelegateeLoaded,
  delegatorBalanceLoaded,
  votingPeriodHoursLoaded,
  quorumLoaded,
  proposalsLoaded,
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
} = delegatedDAO.actions;

export default delegatedDAO.reducer;
