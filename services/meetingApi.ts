import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
                title
            }) => ({
                url: '/api/create-meeting',
                method: 'POST',
                body: { userFromId, scheduledFor, scheduledEnd, title},
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
        deleteMeeting: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/delete-meeting',
                method: 'POST',
                body: { meetingId, userId },
            }),
            // Same pattern: deleting a meeting invalidates the cached meetings list
            invalidatesTags: ['Meeting'],
        }),
        broadcastNow: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-now',
                method: 'POST',
                body: { userId },
            }),
        }),
        broadcastEnd: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/broadcast-end',
                method: 'POST',
                body: { userId },
            }),
        }),
        isUserBroadcasting: builder.query({
            query: ({ userId }) => ({
                url: '/api/is-user-broadcasting',
                method: 'POST',
                body: { userId },
            }),
        }),
    })
});

// Note: getMeetings is now a query, so the hook is useGetMeetingsQuery (not Mutation)
const { useCreateMeetingMutation, useGetMeetingsQuery, useDeleteMeetingMutation, useBroadcastNowMutation, useBroadcastEndMutation, useIsUserBroadcastingQuery } = meetingApi;

export { useCreateMeetingMutation, useDeleteMeetingMutation, useGetMeetingsQuery, useBroadcastNowMutation, useBroadcastEndMutation, useIsUserBroadcastingQuery };

