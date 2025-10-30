
// make sure that you've requested authorization before requesting data, otherwise your app will crash
import { isHealthDataAvailable, useHealthkitAuthorization, useMostRecentQuantitySample } from '@kingstinct/react-native-healthkit';
import { Text, View } from 'react-native';




export default async function StepTimes () : Promise<React.JSX.Element> {
    //  unknown = 0,
//   shouldRequest = 1,
//   unnecessary = 2,
    // useEffect(() => {
    //     async function findStuff() {
            const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization(['HKQuantityTypeIdentifierBloodGlucose'])
            console.log("authorization Status????", authorizationStatus)
            const isAvailable = await isHealthDataAvailable();
            console.log("Is Available ----- ", isAvailable);
            if (authorizationStatus === 1) {
                console.log("should request auth")
                const authStatus2 = await requestAuthorization(); // request read permission for bodyFatPercentage
                console.log("auth status 2", authStatus2)
            }
            if (authorizationStatus === 2) {
                const mostRecentBloodGlucoseSample = useMostRecentQuantitySample('HKQuantityTypeIdentifierBloodGlucose')
                console.log("mostRecentBloodGlucoseSample", mostRecentBloodGlucoseSample)
            }
    //     }
    //     findStuff()
    // }, [])



   //const auth = await requestAuthorization(['HKQuantityTypeIdentifierBodyFatPercentage']); // request read permission for bodyFatPercentage

    //console.log({authorizationStatus})
    // const isAvailable = await isHealthDataAvailable();



    // /* Read latest sample of any data */
    // //await requestAuthorization(['HKQuantityTypeIdentifierBodyFatPercentage']); // request read permission for bodyFatPercentage
  
    // const { quantity, unit, startDate, endDate } = await getMostRecentQuantitySample('HKQuantityTypeIdentifierBodyFatPercentage'); // read latest sample
    
    // console.log(quantity) // 17.5
    // console.log(unit) // %
  
    // //await requestAuthorization(['HKQuantityTypeIdentifierHeartRate']); // request read permission for heart rate
  
    // /* Subscribe to data (Make sure to request permissions before subscribing to changes) */
    // const [hasRequestedAuthorization, setHasRequestedAuthorization] = useState(false);
    
    // useEffect(() => {
    //   requestAuthorization(['HKQuantityTypeIdentifierHeartRate']).then(() => {
    //     setHasRequestedAuthorization(true);
    //   });
    // }, []);
    
    // useEffect(() => {
    //   if (hasRequestedAuthorization) {
    //     const unsubscribe = subscribeToChanges('HKQuantityTypeIdentifierHeartRate', () => {
    //       // refetch data as needed
    //     });
  
    //     return () => unsubscribe();
    //   }
    // }, [hasRequestedAuthorization]);
  
    /* write data */
   // await requestAuthorization([], ['HKQuantityTypeIdentifierInsulinDelivery']); // request write permission for insulin delivery
  

    return (
        <View>
            <Text>
                I am the steps component
            </Text>
        </View>
    );
}