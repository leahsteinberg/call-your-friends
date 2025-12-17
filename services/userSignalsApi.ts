import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userSignalsApi = createApi({
    reducerPath: 'userSignalsApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    tagTypes: ['UserSignals'],
    endpoints: (builder) => ({
        updateSignals: builder.mutation({
            query: ({ userId, signals }) => ({
                url: '/api/update-signals',
                method: 'POST',
                body: { userId, signals },
            }),
            invalidatesTags: ['UserSignals'],
        }),
        getSignals: builder.query({
            query: ({ userId }) => ({
                url: '/api/get-signals',
                method: 'POST',
                body: { userId },
            }),
            providesTags: ['UserSignals'],
        }),
    })
});

const { useUpdateSignalsMutation, useGetSignalsQuery } = userSignalsApi;

export { useUpdateSignalsMutation, useGetSignalsQuery };
