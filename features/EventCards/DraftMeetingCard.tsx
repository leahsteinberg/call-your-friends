import Avatar from "@/components/Avatar/Avatar";
import { EventCard } from "@/components/EventCard/EventCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { useAcceptSuggestionMutation, useDismissSuggestionMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { formatTimeOnly, formatTimezone } from "@/utils/timeStringUtils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { ProcessedMeetingType } from "../Meetings/types";
import CardErrorBanner, { extractErrorMessage } from "./CardErrorBanner";
import GroupTag from "./GroupTag";
import MeetingTitle from "./MeetingTitle";
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 4000);
        return () => clearTimeout(t);
    }, [error]);

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
        } catch (err) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error accepting suggestion:", err);
            setError(extractErrorMessage(err));
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
        } catch (err) {
            dispatch(addMeetingRollback(meeting));
            console.error("Error dismissing suggestion:", err);
            setError(extractErrorMessage(err));
            setIsDismissing(false);
        }
    };

    const avatarUsers = meeting.targetUsers && meeting.targetUsers.length > 0 ? meeting.targetUsers : [];

    return (
        <EventCard backgroundColor={BOLD_BLUE}>
            {/* Hero row: Avatars + (Buttons / Time) */}
            <View style={styles.heroRow}>
                <View style={styles.avatarSection}>
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
                    {/* {avatarUsers.length > 0 && (
                        <Text style={styles.avatarName} numberOfLines={1}>
                            {targetNames}
                        </Text>
                    )} */}
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
                    <Text style={styles.timezoneText}>
                        {formatTimezone(meeting.scheduledFor)}
                    </Text>
                </View>
            </View>

            <MeetingTitle meetingId={meeting.id} title={meeting.title} scheme="dark" />
            {error && <CardErrorBanner key={error} message={error} />}
            <View style={styles.footerRow}>
                {/* Footer: group tag + actions */}
                {meeting.groupName
                    ? <GroupTag groupName={meeting.groupName} />
                    : <View />
                }
                <View style={styles.actionsRow}>
                    <NewTimeButton meetingId={meeting.id} scheduledFor={meeting.scheduledFor} />
                </View>
            </View>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    avatarSection: {
        gap: 4,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarName: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(255,255,255,0.6)',
    },
    heroTime: {
        fontSize: 28,
        fontWeight: '700',
        color: BURGUNDY,
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: -0.5,
    },
    timezoneText: {
        fontSize: 11,
        fontFamily: CustomFonts.ztnatureregular,
        color: BURGUNDY,
        letterSpacing: 0.3,
        marginTop: -4,
    },
    dateText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: BURGUNDY,
        flex: 1,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
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
        justifyContent: 'flex-end',
        gap: 8,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});
