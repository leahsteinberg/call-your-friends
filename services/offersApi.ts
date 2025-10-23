import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const offerApi = createApi({
    reducerPath: 'offerApi',
    baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
    endpoints: (builder) => ({
        getOffers: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/get-offers',
                method: 'POST',
                body: { userId },
            })
        }),
        acceptOffer: builder.mutation({
            query: ({ userId, offerId }) => ({
                url: '/api/accept-offer',
                method: 'POST',
                body: { userId, offerId },
            })
        }),
    })
});

const { useGetOffersMutation, useAcceptOfferMutation } = offerApi;

export { useAcceptOfferMutation, useGetOffersMutation };

