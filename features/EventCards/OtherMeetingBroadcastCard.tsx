import HighFiveStar from "@/assets/images/high-five-star.svg";
import { CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { ACCEPTED_MEETING_STATE, PAST_MEETING_STATE, REJECTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface OtherMeetingBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for broadcast meetings that the user accepted (not created)
export default function OtherMeetingBroadcastCard({ meeting }: OtherMeetingBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelMeeting] = useCancelMeetingMutation();

    const meetingState: MeetingState = meeting.meetingState;

    const handleCancelMeeting = async () => {
        try {
            setIsCanceling(true);

            // Optimistic update FIRST - remove from UI immediately
            dispatch(deleteMeetingOptimistic(meeting.id));

            try {
                const response = await cancelMeeting({
                    meetingId: meeting.id,
                    userId
                }).unwrap();
                console.log("response", response);
                // Success - optimistic update already applied
                setIsCanceling(false);
            } catch (apiError) {
                // ROLLBACK - restore the meeting to UI
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }

        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert('Failed to delete meeting. The item has been restored.');
            setIsCanceling(false);
        }
    };

    const getStatusText = () => {
        switch (meetingState) {
            case SEARCHING_MEETING_STATE:
                return 'Searching';
            case ACCEPTED_MEETING_STATE:
                return 'Confirmed';
            case REJECTED_MEETING_STATE:
                return 'Rejected';
            case PAST_MEETING_STATE:
                return 'Past';
            default:
                return meetingState;
        }
    };

    const getFromName = () => {
        return meeting.userFrom?.name || 'Unknown';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{getFromName()}</Text>
                </View>
                <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleCancelMeeting}
                    style={[styles.cancelButton, isCanceling && styles.cancelButtonDisabled]}
                    disabled={isCanceling}
                >
                    {isCanceling ? (
                        <ActivityIndicator size="small" color="orange" />
                    ) : (
                        <Text style={styles.cancelButtonText}>Unclaim Call</Text>
                    )}
                </TouchableOpacity>
            </View>

            </View>
            <View style={styles.content}>
                <Text style={styles.contentText}>You're on a call right now</Text>
            </View>
                        
                {/* High Five Animation */}
                <HighFiveStar fill={ORANGE} height={20} width={20}/>

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
        marginBottom: 8,
        minHeight: CARD_MIN_HEIGHT,

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameContainer: {
        flexDirection: 'row',
    },
    nameText: {
        fontSize: 30,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,
    },
    buttonContainer: {},
    cancelButton: {
        minWidth: 50,
        alignItems: 'center'
    },
    cancelButtonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    content: {

    },
    contentText: {
        fontFamily: CustomFonts.ztnatureregular,
        color: CORNFLOWER_BLUE,
    },
    animationContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
});
