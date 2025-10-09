import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

  export const authApi = createApi({
      reducerPath: 'authApi',
      baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
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
        postPhoneSignup: builder.mutation({
          query: (credentials) => {
              return {
              url: 'api/signup-phone',
              method: 'POST',
              body: {
                rememberMe: true,
                ...credentials,
              }
            };
          }
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

const {usePostSignInMutation, usePostSignupMutation, usePostPhoneSignupMutation} = authApi;

export { usePostPhoneSignupMutation, usePostSignInMutation, usePostSignupMutation };

