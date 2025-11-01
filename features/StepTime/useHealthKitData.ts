// useHealthKitData.ts
import { useEffect, useState } from 'react';

type HealthData = {
  data: any[];
  loading: boolean;
  error: Error | null;
  authorize: () => Promise<void>;
};

const permissions = [
  'HKQuantityTypeIdentifierBloodGlucose',
  // Add other QuantityTypeIdentifiers here as needed
];

export const useHealthKitData = async (): Promise<Promise<HealthData>> => {
    console.log("IN THE CUSTOM HOOK!!!!")
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(async () => {
      console.log("in use Effect of custom hook!!!!");
      const myTimeoutId = await setTimeout(() => {
        console.log("in set timeout!!!");
        setData(["hi there", "whats up"]);
      }, 1500);
      return (() => {
        clearTimeout(myTimeoutId)
      })
    }, []);
};


  // const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization(['HKQuantityTypeIdentifierBloodGlucose'])

    // console.log("aaaaauthorrijsdfjppppp", authorizationStatus)
        //console.log("req   Auth", requestAuthorization)
        //const auth = await requestAuthorization(['HKQuantityTypeIdentifierBodyFatPercentage']); // request read permission for bodyFatPercentage
   // console.log("got auth back", auth);
    //     console.log("in hook, ", authorizationStatus)
    //     const isAvailable = await isHealthDataAvailable();
    //     console.log("in hook00000", isAvailable)
    // //     console.log("trying to authorize")
    // //   await requestAuthorization(permissions);
    // //   console.log("did authorize")
    //   // Authorization successful, now we can query data
    //   //await fetchData();
    //   console.log("did fetch data")
    // // } catch (err) {
    //     console.log("error", err)
    //   setError(err as Error);
    // }

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     console.log("in fetch data")
//     try {
//     console.log("trying to fetch data")
//       const result = await queryQuantitySamples('HKQuantityTypeIdentifierBloodGlucose');
//       console.log("result", result);
//       setData(result.samples);
//     } catch (err) {
//       setError(err as Error);
//     } finally {
//       setLoading(false);
//     }
//   };


    //authorize();
    // You might want to authorize and fetch data on mount,
    // or call `authorize` from a button press in your component.
    // Call `authorize()` here if you want it to run on component mount.







// import { useHealthkitAuthorization } from "@kingstinct/react-native-healthkit";
// import { useState } from "react";

// export const useMyHealthAuth = async (immediate = false) => {
//     const [authStatus, setAuthStatus] = useState(false);



//     const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization(['HKQuantityTypeIdentifierBloodGlucose'])
//     console.log("authorization Status????", authorizationStatus)
//     // const isAvailable = await isHealthDataAvailable();
//     // console.log("Is Available ----- ", isAvailable);
//     // // if (authorizationStatus === 1) {
//     //     console.log("should request auth")
//     //     const authStatus2 = await requestAuthorization(); // request read permission for bodyFatPercentage
//     //     console.log("auth status 2", authStatus2)
//     // }
//     // if (authorizationStatus === 2) {
//     //     const mostRecentBloodGlucoseSample = useMostRecentQuantitySample('HKQuantityTypeIdentifierBloodGlucose')
//     //     console.log("mostRecentBloodGlucoseSample", mostRecentBloodGlucoseSample)
//     // }

//     return authorizationStatus;
// }


