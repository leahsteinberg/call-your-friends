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
    })
});

const { useGetOffersMutation } = offerApi;

export { useGetOffersMutation };

