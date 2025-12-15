import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { offerApi } from "./offersApi";


const invalidateOffersOnSuccess = async (_arg: any, { dispatch, queryFulfilled }: any) => {
    try {
        await queryFulfilled;
        // After successful mutation, invalidate offer tag in meetingApi
        dispatch(offerApi.util.invalidateTags(['Offer']));
    } catch (error) {
        // Handle error if needed
    }
};

export const meetingApi = createApi({
    reducerPath: 'meetingApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    // Step 1: Declare the tag types this API uses
    // This registers 'Meeting' as a valid tag that queries can provide
    // and mutations can invalidate
    tagTypes: ['Meeting'],
    endpoints: (builder) => ({
        createMeeting: builder.mutation({
            query: ({
                userFromId,
                scheduledFor,
                scheduledEnd,
                title,
                targetType,
                timeType,
                sourceType,
            }) => ({
                url: '/api/create-meeting',
                method: 'POST',
                body: {
                    userFromId,
                    scheduledFor,
                    scheduledEnd,
                    sourceType,
                    targetType,
                    title,
                    timeType,

                },
            }),
            // Step 3: invalidatesTags tells RTK Query:
            // "After this mutation succeeds, any cached data tagged 'Meeting' is stale"
            // This triggers automatic refetch of getMeetings
            invalidatesTags: ['Meeting'],
        }),
        // Step 2: Convert from mutation to query
        // Queries cache their results and can "provide" tags
        getMeetings: builder.query({
            query: ({ userFromId }) => ({
                url: '/api/get-meetings',
                method: 'POST',
                body: { userFromId },
            }),
            // providesTags tells RTK Query: "This cached data is labeled as 'Meeting'"
            // When ANY mutation invalidates 'Meeting', this query will refetch
            providesTags: ['Meeting'],
        }),
        cancelMeeting: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/cancel-meeting',
                method: 'POST',
                body: { meetingId, userId },
            }),
            // Same pattern: deleting a meeting invalidates the cached meetings list
            invalidatesTags: ['Meeting'],
            onQueryStarted: invalidateOffersOnSuccess,
        }),
        broadcastNow: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-now',
                method: 'POST',
                body: { userId },
            }),
            // Invalidate meetings cache when starting broadcast
            invalidatesTags: ['Meeting'],
        }),
        broadcastEnd: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-end',
                method: 'POST',
                body: { userId },
            }),
            // Invalidate meetings cache when ending broadcast
            invalidatesTags: ['Meeting'],
        }),
        isUserBroadcasting: builder.query({
            query: ({ userId }) => ({
                url: '/api/is-user-broadcasting',
                method: 'POST',
                body: { userId },
            }),
        }),
        cancelBroadcastAcceptance: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/cancel-broadcast-acceptance',
                method: 'POST',
                body: { meetingId, userId },
            }),
            // Invalidate meetings cache to trigger refetch after canceling
            invalidatesTags: ['Meeting'],
            // Manually invalidate the Offer tag in the separate offerApi
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // After successful mutation, invalidate Offer tag in offerApi
                    dispatch(offerApi.util.invalidateTags(['Offer']));
                } catch (error) {
                    // Handle error if needed
                }
            },
        }),
    })
});

// Note: getMeetings is now a query, so the hook is useGetMeetingsQuery (not Mutation)
const { useCreateMeetingMutation, useGetMeetingsQuery, useCancelMeetingMutation, useBroadcastNowMutation, useBroadcastEndMutation, useIsUserBroadcastingQuery, useCancelBroadcastAcceptanceMutation } = meetingApi;

export { useBroadcastEndMutation, useBroadcastNowMutation, useCancelBroadcastAcceptanceMutation, useCancelMeetingMutation, useCreateMeetingMutation, useGetMeetingsQuery, useIsUserBroadcastingQuery };

