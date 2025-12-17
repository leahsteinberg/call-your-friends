import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userSignalsApi = createApi({
    reducerPath: 'userSignalsApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    tagTypes: ['UserSignals'],
    endpoints: (builder) => ({
        addUserSignal: builder.mutation({
            query: ({ userId, type, payload }) => ({
                url: '/api/add-user-signal',
                method: 'POST',
                body: { userId, type, payload },
            }),
            invalidatesTags: ['UserSignals'],
        }),
        removeUserSignal: builder.mutation({
            query: ({ userId, signalId }) => ({
                url: '/api/remove-user-signal',
                method: 'POST',
                body: { userId, signalId },
            }),
            invalidatesTags: ['UserSignals'],
        }),
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

const { useAddUserSignalMutation, useRemoveUserSignalMutation, useUpdateSignalsMutation, useGetSignalsQuery } = userSignalsApi;

export { useAddUserSignalMutation, useRemoveUserSignalMutation, useUpdateSignalsMutation, useGetSignalsQuery };
