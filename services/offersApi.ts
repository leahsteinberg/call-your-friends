import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const offerApi = createApi({
    reducerPath: 'offerApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    // Register 'Offer' as a tag type for this API
    tagTypes: ['Offer'],
    endpoints: (builder) => ({
        // Convert to query so it can cache and provide tags
        getOffers: builder.query({
            query: ({ userId }) => ({
                url: '/api/get-offers',
                method: 'POST',
                body: { userId },
            }),
            // This cached data is labeled 'Offer'
            providesTags: ['Offer'],
        }),
        acceptOffer: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/accept-offer',
                method: 'POST',
                body: { userId, offerId },
            }),
            // Accepting changes the offer, so invalidate the cache
            invalidatesTags: ['Offer'],
        }),
        rejectOffer: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/reject-offer',
                method: 'POST',
                body: { userId, offerId },
            }),
            // Rejecting also changes the offer
            invalidatesTags: ['Offer'],
        }),
        // Broadcast-specific mutations
        tryAcceptBroadcast: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/try-accept-broadcast',
                method: 'POST',
                body: { userId, offerId },
            }),
        }),
        acceptBroadcast: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/accept-broadcast',
                method: 'POST',
                body: { userId, offerId },
            }),
            invalidatesTags: ['Offer'],
        }),
        rejectBroadcast: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/reject-broadcast',
                method: 'POST',
                body: { userId, offerId },
            }),
            invalidatesTags: ['Offer'],
        }),
    })
});

// getOffers is now a query, so hook name changes to useGetOffersQuery
const {
    useGetOffersQuery,
    useAcceptOfferMutation,
    useRejectOfferMutation,
    useTryAcceptBroadcastMutation,
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation
} = offerApi;

export {
    useAcceptOfferMutation,
    useGetOffersQuery,
    useRejectOfferMutation,
    useTryAcceptBroadcastMutation,
    useAcceptBroadcastMutation,
    useRejectBroadcastMutation
};

