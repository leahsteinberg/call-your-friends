import Avatar from "@/components/Avatar/Avatar";
import { EventCard } from "@/components/EventCard/EventCard";
import MeetingActionBanner from "@/components/MeetingActionBanner/MeetingActionBanner";
import { eventCardText } from "@/constants/event_card_strings";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useCancelMeetingMutation } from "@/services/meetingApi";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { isMeetingActionable } from "@/utils/meetingTimeUtils";
import { getDisplayNameList, getTargetUserNames } from "@/utils/nameStringUtils";
import { formatTimeOnly, getDisplayDate } from "@/utils/timeStringUtils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";
import NewTimeButton from "./NewTimeButton";

export type MeetingCardState = "SELF_OPEN" | "SELF_ACCEPTED" | "OTHER_ACCEPTED";
export const SELF_OPEN: MeetingCardState = "SELF_OPEN" as const;
export const SELF_ACCEPTED: MeetingCardState = "SELF_ACCEPTED" as const;
export const OTHER_ACCEPTED: MeetingCardState = "OTHER_ACCEPTED" as const;

const AVATAR_SIZE = 52;
const AVATAR_OVERLAP = AVATAR_SIZE * 0.35;

interface MeetingCardProps {
    meeting: ProcessedMeetingType;
}

export default function MeetingCard({ meeting }: MeetingCardProps): React.JSX.Element {
    console.log("MEETING CARD -,", meeting)
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string | undefined = useSelector((state: RootState) => state.auth.user.name);
    const [cancelMeeting] = useCancelMeetingMutation();
    const [isCanceling, setIsCanceling] = useState(false);

    const meetingState: MeetingState  = meeting.meetingState;
    const selfCreatedMeeting = meeting.userFromId === userId;
    const hasAcceptedUsers = meeting.acceptedUserIds.length !== 0;
    const meetingCardState = selfCreatedMeeting ? (hasAcceptedUsers ? SELF_ACCEPTED : SELF_OPEN) : (OTHER_ACCEPTED);

    // Get the relevant users for avatars
    const getAvatarUsers = () => {
        if (meetingCardState === OTHER_ACCEPTED && meeting.userFrom) {
            return [meeting.userFrom];
        }
        if (meetingCardState === SELF_ACCEPTED && meeting.acceptedUsers) {
            return meeting.acceptedUsers;
        }
        if (meetingCardState === SELF_OPEN && meeting.targetUsers) {
            return meeting.targetUsers;
        }
        return [];
    };

    const avatarUsers = getAvatarUsers();

    const getContextText = () => {
        switch (meetingCardState) {
            case SELF_ACCEPTED: {
                const names = getDisplayNameList(meeting.acceptedUsers || []);
                return `${eventCardText.meeting_self_accepted.title(names)}${displayTimeDifference(meeting.scheduledFor)}`;
            }
            case SELF_OPEN: {
                const targetNames = getTargetUserNames(meeting);
                if (targetNames) {
                    return `We'll see if ${targetNames} is free ${displayTimeDifference(meeting.scheduledFor)}`;
                }
                return `${eventCardText.meeting_self_open.title()} ${displayTimeDifference(meeting.scheduledFor)}`;
            }
            case OTHER_ACCEPTED: {
                const name = meeting.userFrom?.name;
                return name ? `Accepted a meeting created by ${name}` : 'Accepted meeting';
            }
        }
    };

    const handleCancelMeeting = async () => {
        try {
            setIsCanceling(true);
            dispatch(deleteMeetingOptimistic(meeting.id));
            try {
                await cancelMeeting({
                    meetingId: meeting.id,
                    userId
                }).unwrap();
                setIsCanceling(false);
            } catch (apiError) {
                dispatch(addMeetingRollback(meeting));
                throw apiError;
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert('Failed to delete meeting. The item has been restored.');
            setIsCanceling(false);
        }
    };

    // Banner is visible when meeting is ≤30 mins away or happening
    const isBannerVisible = isMeetingActionable(meeting.scheduledFor, meeting.scheduledEnd);
    const canShowBanner = meetingCardState !== SELF_OPEN;

    const isLightBg = meetingCardState === SELF_OPEN;
    const timeColor = isLightBg ? '#262626' : CREAM;
    const textColor = isLightBg ? '#262626' : CREAM;
    const mutedColor = isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';

    return (
        <View>
            <EventCard
                backgroundColor={meetingCardState === SELF_OPEN ? PALE_BLUE : BOLD_BLUE}
                hasBanner={canShowBanner && isBannerVisible}
            >
                {/* Hero row: Avatars + Time */}
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
                    <Text style={[styles.heroTime, { color: timeColor }]}>
                        {formatTimeOnly(meeting.scheduledFor)}
                    </Text>
                </View>

                {/* Context text */}
                <Text style={[styles.contextText, { color: textColor }]} numberOfLines={2}>
                    {getContextText()}
                </Text>

                {/* Footer: date + actions */}
                <View style={styles.footerRow}>
                    <Text style={[styles.dateText, { color: mutedColor }]}>
                        {getDisplayDate(meeting.scheduledFor, meeting.displayScheduledFor)}
                    </Text>

                    <View style={styles.actionsRow}>
                        <NewTimeButton meetingId={meeting.id} textColor={textColor} />
                        <EventCard.Button
                            onPress={handleCancelMeeting}
                            loading={isCanceling}
                            variant="primary"
                            size="small"
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </EventCard.Button>
                    </View>
                </View>

                {DEV_FLAG && (
                    <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                )}
            </EventCard>

            {canShowBanner && (
                <MeetingActionBanner
                    meeting={meeting}
                    meetingCardState={meetingCardState}
                    visible={isBannerVisible}
                />
            )}
        </View>
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
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: -0.5,
    },
    contextText: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturemedium,
        lineHeight: 20,
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        flex: 1,
    },
    cancelButtonText: {
        color: PALE_BLUE,
        fontSize: 12,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturemedium,
    },
    debugText: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        fontFamily: CustomFonts.ztnaturelight,
    },
});
