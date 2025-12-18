import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { offerApi } from "./offersApi";


const invalidateOffersOnSuccess = async (_arg: any, { dispatch, queryFulfilled }: any) => {
    try {
        await queryFulfilled;
        // After successful mutation, invalidate offer tag in meetingApi
        dispatch(offerApi.util.invalidateTags(['Offer']));
    } catch (error) {
        console.error('Failed to invalidate offers cache:', error);
        // Fallback: Force refetch after delay to ensure cache consistency
        setTimeout(() => {
            dispatch(offerApi.util.invalidateTags(['Offer']));
        }, 2000);
    }
};

export const meetingApi = createApi({
    reducerPath: 'meetingApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    // Step 1: Declare the tag types this API uses
    // This registers 'Meeting' as a valid tag that queries can provide
    // and mutations can invalidate
    tagTypes: ['Meeting', 'BroadcastStatus'],
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
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
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
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
            onQueryStarted: invalidateOffersOnSuccess,
        }),
        broadcastNow: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-now',
                method: 'POST',
                body: { userId },
            }),
            // Invalidate meetings cache when starting broadcast
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
        }),
        broadcastEnd: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-end',
                method: 'POST',
                body: { userId },
            }),
            // Invalidate meetings cache when ending broadcast
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
        }),
        isUserBroadcasting: builder.query({
            query: ({ userId }) => ({
                url: '/api/is-user-broadcasting',
                method: 'POST',
                body: { userId },
            }),
            providesTags: ['BroadcastStatus'],
        }),
        cancelBroadcastAcceptance: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/cancel-broadcast-acceptance',
                method: 'POST',
                body: { meetingId, userId },
            }),
            // Invalidate meetings cache to trigger refetch after canceling
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
            // Manually invalidate the Offer tag in the separate offerApi
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // After successful mutation, invalidate Offer tag in offerApi
                    dispatch(offerApi.util.invalidateTags(['Offer']));
                } catch (error) {
                    console.error('Failed to invalidate offers cache:', error);
                    // Fallback: Force refetch after delay to ensure cache consistency
                    setTimeout(() => {
                        dispatch(offerApi.util.invalidateTags(['Offer']));
                    }, 2000);
                }
            },
        }),
        acceptSuggestion: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/accept-suggestion',
                method: 'POST',
                body: { meetingId, userId },
            }),
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
        }),
        dismissSuggestion: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/dismiss-suggestion',
                method: 'POST',
                body: { meetingId, userId },
            }),
            invalidatesTags: ['Meeting', 'BroadcastStatus'],
        }),
    })
});

// Note: getMeetings is now a query, so the hook is useGetMeetingsQuery (not Mutation)
const { useCreateMeetingMutation, useGetMeetingsQuery, useCancelMeetingMutation, useBroadcastNowMutation, useBroadcastEndMutation, useIsUserBroadcastingQuery, useCancelBroadcastAcceptanceMutation, useAcceptSuggestionMutation, useDismissSuggestionMutation } = meetingApi;

export { useBroadcastEndMutation, useBroadcastNowMutation, useCancelBroadcastAcceptanceMutation, useCancelMeetingMutation, useCreateMeetingMutation, useGetMeetingsQuery, useIsUserBroadcastingQuery, useAcceptSuggestionMutation, useDismissSuggestionMutation };

