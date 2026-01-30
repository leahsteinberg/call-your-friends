import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

  export const authApi = createApi({
      reducerPath: 'authApi',
      baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
      endpoints: (builder) => ({
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
        }),
        postSignOut: builder.mutation({
          query: (credentials) => {
              return {
              url: 'api/signout',
              method: 'POST',
              body: {
                rememberMe: true,
                ...credentials,
              }
            };
          }
        }),
        postForgotPassword: builder.mutation({
          query: ({ email }) => {
            return {
              url: '/api/forgot-password',
              method: 'POST',
              body: { email },
            };
          }
        }),
      })
  });

const {usePostSignInMutation, usePostPhoneSignupMutation, usePostSignOutMutation, usePostForgotPasswordMutation} = authApi;

export { usePostForgotPasswordMutation, usePostPhoneSignupMutation, usePostSignInMutation, usePostSignOutMutation };

