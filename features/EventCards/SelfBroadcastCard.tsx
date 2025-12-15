import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { endBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { CHOCOLATE_COLOR, CORNFLOWER_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState = meeting.meetingState;
    console.log("self - broadcast meeting, ", meeting);
    // Get the name to display
    const getOtherUserName = () => {
        if (meeting.acceptedUser) {
            const name = meeting.acceptedUser?.name;
            return name ? `${name} has claimed the broadcast.` : 'Broadcast claimed.'; 
        }
    }

    const handleCancelMeeting = async () => {
        try {
            setIsCanceling(true);
            await cancelMeeting({
                meetingId: meeting.id,
                userId
            }).unwrap();

            // Remove from Redux after successful deletion
            dispatch(deleteMeetingOptimistic(meeting.id));

            // Turn off the broadcast toggle
            dispatch(endBroadcast());
        } catch (error) {
            console.error("Error canceling broadcast meeting:", error);
            alert('Failed to cancel broadcast. Please try again.');
            setIsCanceling(false);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchingContainer}>
                    <Text style={styles.searchingText}>{eventCardText.broadcast_self_open.title()}</Text>
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
                        style={[styles.cancelButton, isCanceling && styles.cancelButtonDisabled]}
                        disabled={isCanceling}
                    >
                        {isCanceling ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.cancelButtonText}>End broadcast</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <View>
                <Text style={styles.statusText}>{getOtherUserName()}</Text>
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
    cancelButton: {
        // backgroundColor: CREAM,
        // borderRadius: 4,
        minWidth: 50,


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
});
