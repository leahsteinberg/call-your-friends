import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApi = createApi({
    reducerPath: 'profileApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    tagTypes: ['Profile'],
    endpoints: (builder) => ({
        uploadAvatar: builder.mutation({
            query: ({ userId, imageBase64, mimeType }) => ({
                url: '/api/upload-avatar',
                method: 'POST',
                body: { userId, imageBase64, mimeType },
            }),
            invalidatesTags: ['Profile'],
        }),
        getAvatar: builder.query({
            query: ({ userId }) => ({
                url: '/api/get-avatar',
                method: 'POST',
                body: { userId },
            }),
            providesTags: ['Profile'],
        }),
        getProfile: builder.query({
            query: ({ userId }) => `/api/get-profile/${userId}`,
            providesTags: ['Profile'],
        }),
    })
});

const {
    useUploadAvatarMutation,
    useGetAvatarQuery,
    useGetProfileQuery,
} = profileApi;

export {
    useGetAvatarQuery,
    useGetProfileQuery,
    useUploadAvatarMutation,
};
