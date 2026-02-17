import Avatar from "@/components/Avatar/Avatar";
import { EventCard } from "@/components/EventCard/EventCard";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { getDisplayNameList } from "@/utils/nameStringUtils";
import { formatTimeOnly, getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { ProcessedMeetingType } from "../Meetings/types";
import NewTimeButton from "./NewTimeButton";

const AVATAR_SIZE = 52;
const AVATAR_OVERLAP = AVATAR_SIZE * 0.35;

interface DraftMeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function DraftMeetingCard({ meeting }: DraftMeetingCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [acceptSuggestion] = useAcceptSuggestionMutation();
    const [dismissSuggestion] = useDismissSuggestionMutation();
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    const getTargetNames = (): string => {
        if (meeting.targetUsers && meeting.targetUsers.length > 0) {
            return getDisplayNameList(meeting.targetUsers);
        }
        if (meeting.targetUser?.name) {
            return meeting.targetUser.name;
        }
        return 'someone';
    };

    const handleAcceptSuggestion = async () => {
        try {
            setIsAccepting(true);
            dispatch(deleteMeetingOptimistic(meeting.id));

            await acceptSuggestion({
                meetingId: meeting.id,
                userId,
                scheduledFor: meeting.scheduledFor,
            }).unwrap();

            setIsAccepting(false);
        } catch (error) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error accepting suggestion:", error);
            alert('Failed to accept suggestion. The item has been restored.');
            setIsAccepting(false);
        }
    };

    const handleDismissSuggestion = async () => {
        try {
            setIsDismissing(true);
            dispatch(deleteMeetingOptimistic(meeting.id));

            await dismissSuggestion({
                meetingId: meeting.id,
                userId,
            }).unwrap();

            setIsDismissing(false);
        } catch (error) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error dismissing suggestion:", error);
            alert('Failed to dismiss suggestion. The item has been restored.');
            setIsDismissing(false);
        }
    };

    const targetNames = getTargetNames();
    const isSystemPattern = meeting.sourceType === "SYSTEM_PATTERN";
    const avatarUsers = meeting.targetUsers && meeting.targetUsers.length > 0 ? meeting.targetUsers : [];

    const contextText = (isSystemPattern && meeting.title)
        ? meeting.title
        : `Talk with ${targetNames} ${displayTimeDifference(meeting.scheduledFor)}?`;

    return (
        <EventCard backgroundColor={BOLD_BLUE}>
            {/* Hero row: Avatars + (Buttons / Time) */}
            <View style={styles.heroRow}>
                <View style={styles.avatarRow}>
                    {avatarUsers.map((user, i) => (
                        <View
                            key={user.id ?? i}
                            style={[
                                i > 0 && { marginLeft: -AVATAR_OVERLAP },
                                { zIndex: avatarUsers.length - i },
                            ]}
                        >
                            <Avatar name={user.name} avatarUrl={user.avatarUrl} size={AVATAR_SIZE} />
                        </View>
                    ))}
                </View>
                <View style={styles.heroRight}>
                    <View style={styles.iconButtonRow}>
                        <TouchableOpacity
                            onPress={handleAcceptSuggestion}
                            disabled={isAccepting || isDismissing}
                            style={[styles.iconButton, styles.iconButtonAccept]}
                        >
                            {isAccepting
                                ? <ActivityIndicator size="small" color={CREAM} />
                                : <IconSymbol name="checkmark" size={14} color={CREAM} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDismissSuggestion}
                            disabled={isAccepting || isDismissing}
                            style={[styles.iconButton, styles.iconButtonCancel]}
                        >
                            {isDismissing
                                ? <ActivityIndicator size="small" color={CREAM} />
                                : <IconSymbol name="xmark" size={14} color={CREAM} />
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heroTime}>
                        {formatTimeOnly(meeting.scheduledFor)}
                    </Text>
                </View>
            </View>

            {/* Context text */}
            <Text style={styles.contextText} numberOfLines={2}>
                {contextText}
            </Text>

            {/* Footer: date + actions */}
            <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                    {getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}
                </Text>

                <View style={styles.actionsRow}>
                    <NewTimeButton meetingId={meeting.id} scheduledFor={meeting.scheduledFor} />
                </View>
            </View>

            {DEV_FLAG && (
                <Text style={styles.debugText}>
                    ID: {meeting.id.substring(0, 4)} (DRAFT)
                </Text>
            )}
        </EventCard>
    );
}

const styles = StyleSheet.create({
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroTime: {
        fontSize: 28,
        fontWeight: '700',
        color: CREAM,
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: -0.5,
    },
    contextText: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CREAM,
        lineHeight: 20,
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(255,255,255,0.6)',
        flex: 1,
    },
    heroRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    iconButtonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonAccept: {
        backgroundColor: BURGUNDY,
    },
    iconButtonCancel: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});
