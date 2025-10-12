import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const meetingApi = createApi({
    reducerPath: 'meetingApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    endpoints: (builder) => ({
        createMeeting: builder.mutation({
            query: ({userFromId }) => ({
                url: '/api/create-meeting',
                method: 'POST',
                body: { userFromId },
            })
        }),
        getMeetings: builder.mutation({
            query: ({userFromId }) => ({
                url: '/api/get-meetings',
                method: 'POST',
                body: { userFromId },
            })
        }),
    })
});

const { useCreateMeetingMutation, useGetMeetingsMutation } = meetingApi;

export { useCreateMeetingMutation, useGetMeetingsMutation };

