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
        acceptInvite: builder.mutation({
            query: ({token, userToPhoneNumber}) => ({
                url: '/api/accept-invite',
                method: 'POST',
                body: { token, userToPhoneNumber },
            })
        }),
    })
});

const {useCreateInviteMutation, useAcceptInviteMutation} = contactsApi;

export { useAcceptInviteMutation, useCreateInviteMutation };

