import AnimatedText from "@/components/AnimatedText";
import ConcentricCircles from "@/components/ConcentricCircles";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BURGUNDY, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [endBroadcastRequest] = useBroadcastEndMutation();
    const [isEnding, setIsEnding] = useState(false);

    const meetingState: MeetingState = meeting.meetingState;
    const strings = eventCardText.broadcast_self_open;

    // Get the name to display
    const getOtherUserName = () => {
        if (meeting.acceptedUser) {
            return meeting.acceptedUser?.name;
        }
    }

    const handleCancelMeeting = async () => {
        try {
            setIsEnding(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                await endBroadcastRequest({
                    meetingId: meeting.id,
                    userId
                }).unwrap();

                // Success - turn off the broadcast toggle
                dispatch(endBroadcast());
                setIsEnding(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                // DO NOT call endBroadcast() - broadcast is still active
                throw apiError;
            }

        } catch (error) {
            console.error("Error ending broadcast meeting:", error);
            alert('Failed to cancel broadcast. The item has been restored.');
            setIsEnding(false);
        }
    };


    return (
        <View style={styles.outerContainer}>
        <View style={styles.container}>
            <View style={styles.header}>

                <View style={styles.searchingContainer}>
                    <Text style={styles.searchingText}>{strings.mainText!()}</Text>
                    <AnimatedText
                        text="..."
                        style={{ fontSize: 20, fontFamily: CustomFonts.ztnaturebold, color:ORANGE }}
                        duration={300}
                        staggerDelay={500}
                    />
                </View>
                <View style={styles.buttonContainer}>


                    <TouchableOpacity
                        onPress={handleCancelMeeting}
                        style={[styles.endBroadcastButton, isEnding && styles.endBroadcastButtonDisabled]}
                        disabled={isEnding}
                    >

                        {isEnding ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (

                            <Text style={styles.endBroadcastButtonText}>{strings.acceptButtonText!()}</Text>
                        )}
                    </TouchableOpacity>

                </View>

            </View>
            <View>
                <Text style={styles.statusText}>{strings.subtext!(getOtherUserName())}</Text>
            </View>

            <View style={styles.circleContainerRelative}>
                <ConcentricCircles isActive={true} />
            </View>

            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}

        </View>
        </View>

    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: 20,
        

    },
    container: {
        backgroundColor: PALE_BLUE,
        borderRadius: 8,
        padding: 20,
        overflow: 'hidden', // Clip circles that extend beyond card
    },
    searchingContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
    },
    circleContainerRelative: {
        alignSelf: 'flex-start',
        marginTop: -110,
        marginLeft: -80,
        marginBottom: -30,
        backgroundColor: PALE_BLUE,
        zIndex: -1,
    },
    buttonContainer: {
        //backgroundColor: PEACH,
        alignItems: 'flex-end',

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontFamily: CustomFonts.ztnaturebold,
    },
    searchingText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
    },
    statusText: {
        fontSize: 14,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnatureregular,

    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    endBroadcastButton: {
        minWidth: 40,
        alignItems: 'center',
        backgroundColor: BURGUNDY,
        borderRadius: 15,
        paddingVertical: 5,

    },
    endBroadcastButtonDisabled: {
        opacity: 0.6,
    },
    endBroadcastButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,

    },
});
