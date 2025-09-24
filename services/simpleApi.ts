import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
  export const simpleApi = createApi({
      reducerPath: 'api',
      baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
      endpoints: (builder) => ({
        getSimplePosts: builder.query({
          query: () => '',
        }),
      }),
    });

export const { useGetSimplePostsQuery } = simpleApi;