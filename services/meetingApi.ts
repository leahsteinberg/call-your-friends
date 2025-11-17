import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const meetingApi = createApi({
    reducerPath: 'meetingApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
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
            })
        }),
        getMeetings: builder.mutation({
            query: ({userFromId }) => ({
                url: '/api/get-meetings',
                method: 'POST',
                body: { userFromId },
            })
        }),
        deleteMeeting: builder.mutation({
            query: ({ meetingId, userId }) => ({
                url: '/api/delete-meeting',
                method: 'POST',
                body: { meetingId, userId },
            })
        }),
    })
});

const { useCreateMeetingMutation, useGetMeetingsMutation, useDeleteMeetingMutation } = meetingApi;

export { useCreateMeetingMutation, useDeleteMeetingMutation, useGetMeetingsMutation };

