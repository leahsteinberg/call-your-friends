import { queryQuantitySamples, useHealthkitAuthorization } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { dateObjToMinutesString } from '../Meetings/meetingsUtils';
import { processStepsData } from './useHealthKitData';

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';
const daysPast = 100;
const entriesLimit = 1000;


const getPastDate = ({daysAgo}) => {
    let pastDate = new Date();

    // 2. Set the time to midnight (00:00:00.000)
    pastDate.setHours(0, 0, 0, 0);
    
    // 3. Subtract one day to get yesterday's date
    pastDate.setDate(pastDate.getDate() - daysAgo);
    
    return pastDate;
}

export default function HealthKitData () {

    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState([false])
    const [processedStepsData, setProcessedStepsData] = useState({});
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE])
    const [dataSample, setDataSample] = useState([]);
    console.log("auth stat - ", authorizationStatus, "authed- ", authed);

    const pastDate = getPastDate({daysAgo: daysPast});
    let today = new Date();


    useEffect(() => {
        let isMounted = true;
        console.log("health kit - in use Effect, auth", authed)
        const fetchAuth = async () => {
            try {
                const response = await requestAuthorization([HK_DATA_TYPE]); 
                if (response) { 
                    setAuthed([response]);
                }
            } catch (error) {
                console.error('Error fetching/requesting data:', error);
            }
            try {
                if ( authed ) {
                    const sample = await queryQuantitySamples(
                        HK_DATA_TYPE,
                        {
                            filter: {
                                startDate: pastDate,
                                endDate: today
                            },
                            limit: entriesLimit,
                        }
                    );
                    const processedSample = processStepsData(sample);
                    console.log("processedSample", processedSample)
                    setProcessedStepsData(processedSample[0])
                    setDataSample(sample)
                    setLoading(false)
                }
            } catch (error) {
                console.log("error getting the da    ta", error)
            }
      };
      fetchAuth();
      return () => {
        //isMounted = false; // Set flag to false when component unmounts
      };
    }, []);

                            // {dataSample.map((d, i) => (`#${i}: Steps: ${d.quantity}\nStart: ${dateObjToMinutesString(d.startDate)} \nEnd: ${dateObjToMinutesString(d.endDate)} \n \n`))}


    return (
        <View style={styles.container}>
            <Text >
                Use Health Kit Data - auth - {authed} auth statuys kit{authorizationStatus}
            </Text>
            <Text >
            {/* Day of week & time with most steps: {processedStepsData} */}
            </Text>
            <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={dataSample}
                style={styles.list}
                renderItem={({item}) => (
                    <View style={styles.item}>
                        <Text>{item.quantity}</Text>
                        <Text>Start: {dateObjToMinutesString(item.startDate)}</Text> 
                        <Text>End: {dateObjToMinutesString(item.endDate)}</Text>
                        <Text/>
                    </View>)
                }
            />
        </View>
    );
}




const styles= StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
    },
    list: {
        flex: 1,
    },
    item: {

    }
});