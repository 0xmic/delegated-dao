import { createSlice } from '@reduxjs/toolkit';

export const delegatedDAO = createSlice({
  name: 'delegatedDAO',
  initialState: {
    contract: null,
  },
  reducers: {
    setDelegatedDAOContract: (state, action) => {
      state.contract = action.payload
    },
  }
})

export const {
  setDelegatedDAOContract
} = delegatedDAO.actions;

export default delegatedDAO.reducer;