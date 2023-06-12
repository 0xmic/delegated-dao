import { createSlice } from '@reduxjs/toolkit';

export const delegatedDAO = createSlice({
  name: 'delegatedDAO',
  initialState: {
    contract: null,
    delegatorBalance: 0,
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
    delegatorBalanceLoaded: (state, action) => {
      state.delegatorBalance = action.payload
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
  delegatorBalanceLoaded,
  proposeRequest,
  proposeSuccess,
  proposeFail
} = delegatedDAO.actions;

export default delegatedDAO.reducer;