import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { endBroadcast } from "@/features/Broadcast/broadcastSlice";
import { useDeleteMeetingMutation } from "@/services/meetingApi";
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
    const [deleteMeeting] = useDeleteMeetingMutation();
    const [isDeleting, setIsDeleting] = useState(false);

    const meetingState: MeetingState = meeting.meetingState;
    console.log("self - broadcast meeting, ", meeting);
    // Get the name to display
    const getOtherUserName = () => {
        if (meeting.acceptedUser) {
            const name = meeting.acceptedUser?.name;
            return name ? `${name} has claimed the broadcast.` : 'Broadcast claimed.'; 
        }
    }

    const handleDeleteMeeting = async () => {
        try {
            setIsDeleting(true);
            await deleteMeeting({
                meetingId: meeting.id,
                userId
            }).unwrap();

            // Remove from Redux after successful deletion
            dispatch(deleteMeetingOptimistic(meeting.id));

            // Turn off the broadcast toggle
            dispatch(endBroadcast());
        } catch (error) {
            console.error("Error deleting broadcast meeting:", error);
            alert('Failed to delete broadcast. Please try again.');
            setIsDeleting(false);
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
                        onPress={handleDeleteMeeting}
                        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.deleteButtonText}>End broadcast</Text>
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
    deleteButton: {
        // backgroundColor: CREAM,
        // borderRadius: 4,
        minWidth: 50,


    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,

    },
});
