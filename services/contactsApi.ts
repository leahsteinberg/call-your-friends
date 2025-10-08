import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
  
export const contactsApi = createApi({
    reducerPath: 'contactsApi',
    baseQuery: fetchBaseQuery({ baseUrl: `http://${process.env.EXPO_PUBLIC_EXPRESS_URL}:3000` }),
    endpoints: (builder) => ({
        createInvite: builder.mutation({
            query: ({userFromId, userToPhoneNumber}) => ({
                url: '/api/create-invite',
                method: 'POST',
                body: { userFromId, userToPhoneNumber },
            })
        })
    })
});

const {useCreateInviteMutation} = contactsApi;

export { useCreateInviteMutation };
