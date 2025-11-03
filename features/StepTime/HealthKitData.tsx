import { queryQuantitySamples, useHealthkitAuthorization } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';


const getPastDate = ({daysAgo}) => {
    let pastDate = new Date();

    // 2. Set the time to midnight (00:00:00.000)
    pastDate.setHours(0, 0, 0, 0);
    
    // 3. Subtract one day to get yesterday's date
    pastDate.setDate(pastDate.getDate() - daysAgo);
    
    console.log("yesterday midngith", pastDate.toLocaleDateString());
    return pastDate;

}

export default function HealthKitData () {
    const [authed, setAuthed] = useState([false])
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE])
    const [dataSample, setDataSample] = useState([])
    console.log("auth stat - ", authorizationStatus, "authed- ", authed)

    const pastDate = getPastDate({daysAgo: 31});
    let today = new Date();


    useEffect(() => {
        let isMounted = true; // Flag to track if component is mounted
        console.log("in use Effect, auth isbmnbmn ", authed)
        const fetchAuth = async () => {
            try {
                console.log("trying")
                const response = await requestAuthorization([HK_DATA_TYPE]); // request read permission for bodyFatPercentage
                if (response) { // Only update state if component is still mounted
                    //console.log("response", response)
                    setAuthed([response])
                
                }
            } catch (error) {
            console.error('Error fetching/requesting data:', error);
            }
            try {
                if(authed ) {
                    const sample = await queryQuantitySamples(
                        HK_DATA_TYPE,
                        {
                            filter: {
                                startDate: pastDate,
                                endDate: today
                            },
                            limit: 100,
                        }
                    );
                    setDataSample(sample)
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
        <ScrollView>
            <Text>
                Use Health Kit Data - auth - {authed} auth statuys kit{authorizationStatus}
            </Text>
            <Text>
                Got this many step units: {dataSample.length}
                </Text>
                <Text>
                    {dataSample.map((d, i) => (`#${i} - ${d.quantity}: ${d.startDate} --> \n${d.endDate} \n \n`))}
                </Text>
        </ScrollView>
    );

}