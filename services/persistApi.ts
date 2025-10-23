import type { Action } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { REHYDRATE } from 'redux-persist'

type RootState = any // normally inferred from state


function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
    key: string
    payload: RootState
    err: unknown
  } {
    return action.type === REHYDRATE
  }

  export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    // to prevent circular type issues, the return type needs to be annotated as any
    extractRehydrationInfo(action, { reducerPath }): any {
        console.log("IN REHYDRATION!!!!!")
      if (isHydrateAction(action)) {
        // when persisting the api reducer
        if (action.key === 'key used with redux-persist') {
          return action.payload
        }
  
        // When persisting the root reducer
        return action.payload[api.reducerPath]
      }
    },
    endpoints: (build) => ({
      // omitted
    }),
  })