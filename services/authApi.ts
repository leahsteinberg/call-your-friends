import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
  export const authApi = createApi({
      reducerPath: 'api',
      baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
      endpoints: (builder) => ({
        postSignup: builder.mutation({
          query: (credentials) => ({
            url: '/api/signup',
            method: 'POST',
            body: {
              rememberMe: true,
              ...credentials
            }, 
          }),
        }),
        postSignIn: builder.mutation({
          query: (credentials) => {
            return {
              url:'/api/signInEmail',
              method: 'POST',
              body: credentials,
            }
          },
        })
      })
  });

const {usePostSignInMutation, usePostSignupMutation} = authApi;

export { usePostSignInMutation, usePostSignupMutation };
