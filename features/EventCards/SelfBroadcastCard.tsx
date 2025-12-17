import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { deleteMeetingOptimistic, addMeetingRollback } from "../Meetings/meetingSlice";
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
                <View>
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


            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: PALE_BLUE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    searchingContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
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
        minWidth: 50,
    },
    endBroadcastButtonDisabled: {
        opacity: 0.6,
    },
    endBroadcastButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,

    },
});
