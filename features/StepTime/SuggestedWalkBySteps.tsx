import { queryQuantitySamples, useHealthkitAuthorization, type QuantitySample } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { displayDateTime } from '../Meetings/meetingsUtils';
import { processStepsData } from './useHealthKitData';

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';
const DAYS_OF_HISTORY = 200;
const MAX_ENTRIES = 2000;

interface GetPastDateParams {
    daysAgo: number;
}

/**
 * Get a date in the past, set to midnight
 */
const getPastDate = ({ daysAgo }: GetPastDateParams): Date => {
    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate;
}

export default function SuggestedWalkBySteps() {
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [suggestedWalkTime, setSuggestedWalkTime] = useState<string>('');
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE]);
    const [stepsData, setStepsData] = useState<QuantitySample[]>([]);

    console.log("auth status:", authorizationStatus, "authorized:", isAuthorized);

    const pastDate = getPastDate({ daysAgo: DAYS_OF_HISTORY });
    const today = new Date();


    useEffect(() => {
        const fetchHealthKitDataAndGenerateSuggestion = async () => {
            try {
                // Request HealthKit authorization
                const authResponse = await requestAuthorization([HK_DATA_TYPE]);
                if (authResponse) {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Error requesting HealthKit authorization:', error);
            }

            try {
                if (isAuthorized) {
                    // Query step count data from HealthKit
                    const stepsSamples = await queryQuantitySamples(
                        HK_DATA_TYPE,
                        {
                            filter: {
                                startDate: pastDate,
                                endDate: today
                            },
                            limit: MAX_ENTRIES,
                        }
                    );

                    // Process steps data to find the best time for a walk
                    // This analyzes historical step patterns to suggest when the user is most active
                    const suggestedWalkDateTime = processStepsData(stepsSamples);
                    console.log("Suggested walk time:", suggestedWalkDateTime);

                    setSuggestedWalkTime(displayDateTime(suggestedWalkDateTime));
                    setStepsData(stepsSamples);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching steps data:", error);
            }
        };

        fetchHealthKitDataAndGenerateSuggestion();
    }, [isAuthorized]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Using HealthKit Data
            </Text>
            <Text style={styles.description}>
                Suggested next time to talk, based on your walking patterns:
            </Text>
            <Text style={styles.walkTime}>
                {suggestedWalkTime}
            </Text>
        </View>
    );
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
    },
    title: {
        fontWeight: 'bold',
    },
    description: {
        marginTop: 8,
    },
    walkTime: {
        marginTop: 4,
        fontWeight: '600',
    },
});