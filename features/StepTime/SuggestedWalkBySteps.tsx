import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BRIGHT_GREEN, CREAM, DARK_GREEN, LIGHT_BEIGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { SignalType, UserSignal, WALK_PATTERN_SIGNAL_TYPE, WalkPatternPayload } from "@/types/userSignalsTypes";
import { queryQuantitySamples, useHealthkitAuthorization, type QuantitySample } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { displayDateTime } from '../Meetings/meetingsUtils';
import { processStepsData } from './useHealthKitData';

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';
const DAYS_OF_HISTORY = 200;
const MAX_ENTRIES = 2000;

interface GetPastDateParams {
    daysAgo: number;
}

const getPastDate = ({ daysAgo }: GetPastDateParams): Date => {
    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate;
}

interface SuggestedWalkByStepsProps {
    userSignal?: UserSignal<SignalType> | null;
}

export default function SuggestedWalkBySteps({ }: SuggestedWalkByStepsProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [suggestedWalkTime, setSuggestedWalkTime] = useState<string>('');
    const [suggestedWalkDateTime, setSuggestedWalkDateTime] = useState<Date | null>(null);
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE]);
    const [stepsData, setStepsData] = useState<QuantitySample[]>([]);
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [addUserSignal, { isLoading: isCallingIntent }] = useAddUserSignalMutation();
    const [removeUserSignal, { isLoading: isUndoing }] = useRemoveUserSignalMutation();

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
                    const suggestedWalkDateTimeStr = processStepsData(stepsSamples);
                    const suggestedDateTime = new Date(suggestedWalkDateTimeStr);

                    setSuggestedWalkDateTime(suggestedDateTime);
                    const displayString = await displayDateTime(suggestedDateTime.toISOString());
                    setSuggestedWalkTime(displayString);
                    setStepsData([...stepsSamples]);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching steps data:", error);
            }
        };

        fetchHealthKitDataAndGenerateSuggestion();
    }, [isAuthorized]);


    const handleAddWalkSignal = async () => {
        try {
            const payload: WalkPatternPayload = { };
            await addUserSignal({
              userId,
              type: WALK_PATTERN_SIGNAL_TYPE,
              payload
            }).unwrap();
          } catch (error) {
            console.error("Error setting call intent:", error);
            alert('Failed to set call intent. Please try again.');
          }
    };

    const isDisabled = !suggestedWalkDateTime || loading;

    return (
        <TouchableOpacity
            style={[styles.container, isDisabled && styles.disabledContainer]}
            onPress={handleAddWalkSignal}
            disabled={isDisabled}
        >
            <Text style={styles.title}>
                Chat with a friend on your next walk.
            </Text>
            <Text style={styles.description}>
                Suggestion informed by your walking habits.
            </Text>
            <Text style={[styles.walkTime, isDisabled && styles.disabledText]}>
                {suggestedWalkTime || 'Loading...'}
            </Text>
            <Text style={styles.actionHint}>
                Tap to find a friend who's free at that time
            </Text>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: DARK_GREEN,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledContainer: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    title: {
        fontWeight: 'bold',
        color: CREAM,
        fontSize: 16,
    },
    description: {
        marginTop: 8,
        color: CREAM,
        fontSize: 14,
    },
    walkTime: {
        marginTop: 4,
        fontWeight: '600',
        color: CREAM,
        fontSize: 18,
    },
    disabledText: {
        color: '#666',
    },
    actionHint: {
        marginTop: 8,
        color: CREAM,
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    confirmationContainer: {
        backgroundColor: LIGHT_BEIGE,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: BRIGHT_GREEN,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    confirmationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: DARK_GREEN,
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmationTime: {
        fontSize: 20,
        fontWeight: 'bold',
        color: BRIGHT_GREEN,
        textAlign: 'center',
    },
});