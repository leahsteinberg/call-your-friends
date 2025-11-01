import { queryQuantitySamples, useHealthkitAuthorization } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';

export default function HealthKitData () {
    const [authed, setAuthed] = useState([false])
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE])
    const [dataSample, setDataSample] = useState([])
    console.log("auth stat - ", authorizationStatus, "authed- ", authed)

    let yesterdayMidnight = new Date();

    // 2. Set the time to midnight (00:00:00.000)
    yesterdayMidnight.setHours(0, 0, 0, 0);
    
    // 3. Subtract one day to get yesterday's date
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 2);
    
    console.log("yesterday midngith", yesterdayMidnight.toLocaleDateString());

    let today = new Date();


    useEffect(() => {
        let isMounted = true; // Flag to track if component is mounted
        console.log("in use Effect, auth isbmnbmn ", authed)
        const fetchAuth = async () => {
            try {
                console.log("trying")
                const response = await requestAuthorization([HK_DATA_TYPE]); // request read permission for bodyFatPercentage
                if (response) { // Only update state if component is still mounted
                    console.log("response", response)
                    setAuthed([response])
                
                }
            } catch (error) {
            console.error('Error fetching/requesting data:', error);
            }
            try {
                if(authed ) {
                    console.log("tryinmmg    query")
                    //const { quantity, unit, startDate, endDate } = await getMostRecentQuantitySample(HK_DATA_TYPE); // read latest sample
                    const sample = await queryQuantitySamples(
                        HK_DATA_TYPE,
                        {
                            filter: {
                                startDate: yesterdayMidnight,
                                endDate: today
                            },
                            limit: 35,
                        }
                    );
                    setDataSample(sample)
                    // console.log("got the data", { quantity, unit, startDate, endDate })
                    console.log("got the sample LLLLLLLjkj- ", sample)
                }
            } catch (error) {
                console.log("error getting the data", error)
            }
      };
      fetchAuth();
      return () => {
        //isMounted = false; // Set flag to false when component unmounts
      };
    }, []);

    return (
        <View>
            <Text>
                Use Health Kit Data - auth - {authed} auth statuys kit{authorizationStatus}
            </Text>
            <Text>
                Got this many step unitssss: {dataSample.length}
                </Text>

                <Text>
                    {JSON.stringify(dataSample.map((d) => ({quant: d.quantity, end: d.endDate, start: d.startDate})))}
                </Text>
        </View>
    );

}