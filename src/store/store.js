import { configureStore } from '@reduxjs/toolkit'

import provider from './reducers/provider'

export const store = configureStore({
  reducer: {
    provider: provider
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })

})