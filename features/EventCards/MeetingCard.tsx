import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    console.log("MEETING CARDF -,", meeting)
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string | undefined = useSelector((state: RootState) => state.auth.user.name);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState  = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;

    // Check if meeting is PAST and started more than 30 minutes ago
    const isOldPastMeeting = () => {
        if (meetingState !== PAST_MEETING_STATE) return false;
        const scheduledTime = new Date(meeting.scheduledFor).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        return scheduledTime < thirtyMinutesAgo;
    };


    const getOpenMeetingTitle = () => {
        return (
            <Text style={styles.searchingText}>
                <Text>{eventCardText.meeting_self_open.title()}{'\n'}</Text>
                <View style={styles.displayTimeContainer}>
                    <Text style={styles.searchingText}>{displayTimeDifference(meeting.scheduledFor)}</Text>
                    <AnimatedText
                        text="..."
                        style={{ fontSize: 20, fontFamily: CustomFonts.ztnaturebold, color: ORANGE }}
                        duration={300}
                        staggerDelay={500}
                        inline={false}
                    />
                </View>
            </Text>
        );
    };

    const getClaimedSelfMeetingTitle = () => {
        console.log("hii getCLaimedddd")
        // Try new multi-user field first, fall back to single acceptedUser
        let name: string | undefined;
        if (meeting.acceptedUsers && meeting.acceptedUsers.length > 0) {
            const names = meeting.acceptedUsers.map(user => user.name).filter(Boolean);
            name = names.length > 0 ? names.join(', ') : undefined;
        } else {
            name = meeting.acceptedUser?.name;
        }
        return (
        <View style={styles.searchingText}>
            <Text style={styles.searchingText}>
                {eventCardText.meeting_self_accepted.title(name)}{displayTimeDifference(meeting.scheduledFor)}
            </Text>
        </View>
    );
};
    
    // Helper to get target user names - handles both single and multiple target users
    const getTargetUserNames = () => {
        // Try new multi-user field first
        if (meeting.targetUsers && meeting.targetUsers.length > 0) {
            const names = meeting.targetUsers.map(user => user.name).filter(Boolean);
            if (names.length > 0) {
                return names.join(', ');
            }
        }
        // Fallback to single targetUser for backwards compatibility
        if (meeting.targetUser?.name && meeting.targetUserId) {
            return meeting.targetUser.name;
        }
        // Also check targetUserIds array
        if (meeting.targetUserIds && meeting.targetUserIds.length > 0) {
            return null; // IDs exist but no name data
        }
        return null;
    };

    const getMainDisplay = () => {
        if (selfCreatedMeeting) {
            // Check if meeting has been accepted - try new multi-user field first
            const hasAcceptedUsers = (meeting.acceptedUsers && meeting.acceptedUsers.length > 0) || meeting.acceptedUser;

            if (hasAcceptedUsers) {
                return getClaimedSelfMeetingTitle()
            } else {
                // Check if there are target users for open meetings
                const targetNames = getTargetUserNames();
                if (targetNames) {
                    const baseTitle = getOpenMeetingTitle();
                    return `sent an offer out to → ${targetNames}`;
                }
                return getOpenMeetingTitle();
            }
        }
        const name = meeting.userFrom?.name;
        const baseText = name ? `Accepted a meeting created by ${name}` : null;

        // Check if there are target users for accepted meetings
        const targetNames = getTargetUserNames();
        if (baseText && targetNames) {
            return `${baseText} → ${targetNames}`;
        }
        return baseText;
    };

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

    const mainDisplayText = getMainDisplay();

    return (
        <View style={styles.outerContainer}>
        <View style={[styles.container, isOldPastMeeting() && styles.oldPastContainer]}>
            <View style={styles.header}>
            {mainDisplayText && (
                <Text style={styles.mainText}>{mainDisplayText}</Text>
            )}
                <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleCancelMeeting}
                            style={[styles.deleteButton, isCanceling && styles.deleteButtonDisabled]}
                            disabled={isCanceling}
                        >
                            {isCanceling ? (
                                <ActivityIndicator size="small" color="red" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Cancel</Text>
                            )}
                        </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.timeText}>{getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}</Text>
            {DEV_FLAG && (
                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
            )}
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,
    },
    container: {
        backgroundColor: PALE_BLUE,
        borderRadius: 8,
        padding: 12,
        minHeight: CARD_MIN_HEIGHT,
    },
    oldPastContainer: {
        backgroundColor: '#E8E8E8',
        opacity: 0.7,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        //alignItems: 'center',
        marginBottom: 8,
    },
    buttonContainer: {
    },
    searchingText: {
        fontSize: 20,
        fontWeight: '600',
        //maxWidth: 100,
        color: ORANGE,
        fontFamily: CustomFonts.ztnaturebold,
        //flexShrink: 1, // Allow text to wrap
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: BRIGHT_BLUE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnatureregular,

    },
    mainText: {
        fontSize: 20,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
        fontFamily: CustomFonts.ztnaturebold,
        flexShrink: 1, // Allow text to wrap/shrink to prevent overflow
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
    deleteButton: {
        //minWidth: 50,
        //marginLeft: 10,
        //alignItems: 'flex-end',
    },
    displayTimeContainer: {
        flexDirection: 'row',
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        color: CHOCOLATE_COLOR,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturebold
    },
});
