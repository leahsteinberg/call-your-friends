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
              url: '/api/auth/forget-password/email-otp',
              method: 'POST',
              body: { email },
            };
          }
        }),
        postResetPassword: builder.mutation({
          query: ({ email, otp, password }) => {
            return {
              url: '/api/auth/email-otp/reset-password',
              method: 'POST',
              body: { email, otp, password },
            };
          }
        }),
      })
  });

const {usePostSignInMutation, usePostPhoneSignupMutation, usePostSignOutMutation, usePostForgotPasswordMutation, usePostResetPasswordMutation} = authApi;

export { usePostForgotPasswordMutation, usePostPhoneSignupMutation, usePostResetPasswordMutation, usePostSignInMutation, usePostSignOutMutation };

