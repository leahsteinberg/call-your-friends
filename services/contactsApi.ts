import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
  
export const contactsApi = createApi({
    reducerPath: 'contacts',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
    endpoints: (builder) => ({
    addContact: builder.mutation({
        query: (credentials) => ({
        url: '/api/addContacts',
        method: 'POST',
        body: {
            entry: 'hi there!!!',
        }, 
        }),
    })
   })
  });

const {useAddContactMutation} = contactsApi;

export { useAddContactMutation };
