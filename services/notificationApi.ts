import { HOST_WITH_PORT } from "@/environment";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

  export const notificationApi = createApi({
      reducerPath: 'notificationApi',
      baseQuery: fetchBaseQuery({ baseUrl: HOST_WITH_PORT }),
      endpoints: (builder) => ({
        postRegisterPush: builder.mutation({
          query: ({pushToken, userId, timeZone}) => {
              return {
              url: 'api/register-push',
              method: 'POST',
              body: {
                pushToken,
                userId,
                timeZone,
              }
            };
          }
        }),
      })
  });

const { usePostRegisterPushMutation } = notificationApi;

export { usePostRegisterPushMutation };

