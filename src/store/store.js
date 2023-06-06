import { configureStore } from '@reduxjs/toolkit'

import provider from './reducers/provider'
import token from './reducers/token'
import delegatedDAO from './reducers/delegatedDAO'

export const store = configureStore({
  reducer: {
    provider: provider,
    token: token,
    delegatedDAO: delegatedDAO
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })

})