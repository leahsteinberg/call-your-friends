import { HOST_WITH_PORT } from '@/environment';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface GroupMember {
    id: string;
    displayUsername: string;
    avatarUrl?: string;
}

export interface Group {
    id: string;
    name: string;
    ownerId: string;
    members: GroupMember[];
}

export const groupsApi = createApi({
    reducerPath: 'groupsApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    tagTypes: ['Groups'],
    endpoints: (builder) => ({
        createGroup: builder.mutation<Group, { userId: string; name: string; memberIds?: string[] }>({
            query: ({ userId, name, memberIds }) => ({
                url: '/api/create-group',
                method: 'POST',
                body: { userId, name, ...(memberIds && { memberIds }) },
            }),
            invalidatesTags: ['Groups'],
        }),

        getGroups: builder.query<Group[], { userId: string }>({
            query: ({ userId }) => ({
                url: '/api/get-groups',
                method: 'POST',
                body: { userId },
            }),
            providesTags: ['Groups'],
        }),

        addGroupMember: builder.mutation<void, { requesterId: string; groupId: string; userId: string }>({
            query: ({ requesterId, groupId, userId }) => ({
                url: '/api/add-group-member',
                method: 'POST',
                body: { requesterId, groupId, userId },
            }),
            invalidatesTags: ['Groups'],
        }),

        removeGroupMember: builder.mutation<void, { requesterId: string; groupId: string; userId: string }>({
            query: ({ requesterId, groupId, userId }) => ({
                url: '/api/remove-group-member',
                method: 'POST',
                body: { requesterId, groupId, userId },
            }),
            invalidatesTags: ['Groups'],
        }),

        deleteGroup: builder.mutation<void, { requesterId: string; groupId: string }>({
            query: ({ requesterId, groupId }) => ({
                url: '/api/delete-group',
                method: 'POST',
                body: { requesterId, groupId },
            }),
            invalidatesTags: ['Groups'],
        }),
    }),
});

export const {
    useCreateGroupMutation,
    useGetGroupsQuery,
    useAddGroupMemberMutation,
    useRemoveGroupMemberMutation,
    useDeleteGroupMutation,
} = groupsApi;
