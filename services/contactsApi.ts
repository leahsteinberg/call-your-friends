import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contactsApi = createApi({
    reducerPath: 'contactsApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    endpoints: (builder) => ({
        createInvite: builder.mutation({
            query: ({userFromId, userToPhoneNumber}) => ({
                url: '/api/create-invite',
                method: 'POST',
                body: { userFromId, userToPhoneNumber },
            })
        }),
        acceptInviteSignUp: builder.mutation({
            query: ({token, email, phoneNumber, name, password}) => ({
                url: '/api/sign-up-accept-invite',
                method: 'POST',
                body: { token, email, phoneNumber, name, password },
            })
        }),
        acceptInviteSignIn: builder.mutation({
            query: ({token, email, phoneNumber, password}) => ({
                url: '/api/sign-in-accept-invite',
                method: 'POST',
                body: { token, email, phoneNumber, password },
            })
        }),
        userByPhone: builder.mutation({
            query: ({userPhoneNumber}) => ({
                url: '/api/user-by-phone',
                method: 'POST',
                body: { userPhoneNumber },
            })
        }),
        getFriends: builder.mutation({
            query: ({id}) => ({
                url: '/api/get-friends',
                method: 'POST',
                body: { id },
            })
        }),
        getSentInvites: builder.mutation({
            query: ({id}) => ({
                url: '/api/get-sent-invites',
                method: 'POST',
                body: { id },
            })
        })
    })
});

const {
    useCreateInviteMutation,
    useAcceptInviteSignInMutation,
    useAcceptInviteSignUpMutation,
    useUserByPhoneMutation,
    useGetFriendsMutation,
    useGetSentInvitesMutation,
    } = contactsApi;

export {
    useAcceptInviteSignInMutation,
    useAcceptInviteSignUpMutation,
    useCreateInviteMutation,
    useGetFriendsMutation,
    useGetSentInvitesMutation,
    useUserByPhoneMutation
};

