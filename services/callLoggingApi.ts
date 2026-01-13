import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions based on Prisma UserEvent model
export interface CallStartRequest {
    userId: string;
    participantId: string;
    meetingId?: string;
    callType?: 'phone' | 'video';
}

export interface CallEndRequest {
    userId: string;
    participantId: string;
    meetingId?: string;
    duration: number;  // in seconds
    endReason?: 'completed' | 'canceled' | 'error';
}

export interface CallErrorRequest {
    userId: string;
    participantId: string;
    meetingId?: string;
    errorMessage: string;
    errorCode?: string;
}

export interface CallLogResponse {
    eventId: string;
    userId: string;
    eventType: string;
    metadata: any;
    createdAt: string;
}

export const callLoggingApi = createApi({
    reducerPath: 'callLoggingApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    endpoints: (builder) => ({
        startCall: builder.mutation<CallLogResponse, CallStartRequest>({
            query: (data) => ({
                url: '/api/calls/start',
                method: 'POST',
                body: data,
            }),
        }),
        endCall: builder.mutation<CallLogResponse, CallEndRequest>({
            query: (data) => ({
                url: '/api/calls/end',
                method: 'POST',
                body: data,
            }),
        }),
        logCallError: builder.mutation<CallLogResponse, CallErrorRequest>({
            query: (data) => ({
                url: '/api/calls/error',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

// Export hooks following app conventions
const {
    useStartCallMutation,
    useEndCallMutation,
    useLogCallErrorMutation
} = callLoggingApi;

export {
    useEndCallMutation,
    useLogCallErrorMutation, useStartCallMutation
};

