
import { HOST_WITH_PORT } from '@/environment';
import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

export default function StepTimes() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    const fetchData = async () => {
      try {
        const response = await fetch(`${HOST_WITH_PORT}/api/sample`);
        const result = await response.json();
        if (isMounted) { // Only update state if component is still mounted
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Set flag to false when component unmounts
    };
  }, []);

  return (
    <View>
        <Text>{Platform.OS === 'ios' ? 'Step Component' : 'Step Component only works on iOS.'}</Text>
      {/* {data ? <Text>Data: {JSON.stringify(data)}</Text> : <Text>Loading...</Text>} */}
    </View>
  );
}














// // make sure that you've requested authorization before requesting data, otherwise your app will crash
// import { use } from 'react';
// import { Text, View } from 'react-native';


// export default async function StepTimes ({dataPromise}) : Promise<React.JSX.Element> {

//     //const { data, loading, error, authorize } = useHealthKitData();
//     //console.log("in component", {data, loading, error, authorize})
    
//     const data = use(dataPromise);
    
//     return (
//         <View>
//             <Text>
//                 I am the steps component
//             </Text>
//             <Text>{data}</Text>
//         </View>
//     );
// }
    
    
//     // if (authorize) {
//     //    // authorize();
//     // }
//     //  unknown = 0,
// //   shouldRequest = 1,
// //   unnecessary = 2,
//     // useEffect(() => {
//     //     async function findStuff() {

//     //     findStuff()
//     // }, [])
//     // const authStatus = await useMyHealthAuth(false);
//     // console.log("auth status in component", authStatus);


//    //const auth = await requestAuthorization(['HKQuantityTypeIdentifierBodyFatPercentage']); // request read permission for bodyFatPercentage

//     //console.log({authorizationStatus})
//     // const isAvailable = await isHealthDataAvailable();



//     // /* Read latest sample of any data */
//     // //await requestAuthorization(['HKQuantityTypeIdentifierBodyFatPercentage']); // request read permission for bodyFatPercentage
  
//     // const { quantity, unit, startDate, endDate } = await getMostRecentQuantitySample('HKQuantityTypeIdentifierBodyFatPercentage'); // read latest sample
    
//     // console.log(quantity) // 17.5
//     // console.log(unit) // %
  
//     // //await requestAuthorization(['HKQuantityTypeIdentifierHeartRate']); // request read permission for heart rate
  
//     // /* Subscribe to data (Make sure to request permissions before subscribing to changes) */
//     // const [hasRequestedAuthorization, setHasRequestedAuthorization] = useState(false);
    
//     // useEffect(() => {
//     //   requestAuthorization(['HKQuantityTypeIdentifierHeartRate']).then(() => {
//     //     setHasRequestedAuthorization(true);
//     //   });
//     // }, []);
    
//     // useEffect(() => {
//     //   if (hasRequestedAuthorization) {
//     //     const unsubscribe = subscribeToChanges('HKQuantityTypeIdentifierHeartRate', () => {
//     //       // refetch data as needed
//     //     });
  
//     //     return () => unsubscribe();
//     //   }
//     // }, [hasRequestedAuthorization]);
  
//     /* write data */
//    // await requestAuthorization([], ['HKQuantityTypeIdentifierInsulinDelivery']); // request write permission for insulin delivery
  

