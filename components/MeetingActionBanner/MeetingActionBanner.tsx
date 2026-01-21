import CallUserButton from "@/components/CallUserButton/CallUserButton";
import MiniBroadcastButton from "@/components/CardActionDecorations/MiniBroadcastButton";
import { CustomFonts } from "@/constants/theme";
import { User } from "@/features/Auth/types";
import { MeetingCardState, OTHER_ACCEPTED, SELF_ACCEPTED } from "@/features/EventCards/MeetingCard";
import { ProcessedMeetingType } from "@/features/Meetings/types";
import { BURGUNDY, CREAM, BOLD_BLUE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { isMeetingHappening } from "@/utils/meetingTimeUtils";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, SlideInDown } from "react-native-reanimated";
import { useSelector } from "react-redux";

interface MeetingActionBannerProps {
    meeting: ProcessedMeetingType;
    meetingCardState: MeetingCardState;
}

export default function MeetingActionBanner({
    meeting,
    meetingCardState,
}: MeetingActionBannerProps): React.JSX.Element {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const isHappening = isMeetingHappening(meeting.scheduledFor, meeting.scheduledEnd);
    const pulseOpacity = useSharedValue(1);

    // Determine target users based on meeting state
    const getTargetData = (): {
        targetUserIds: string[];
        targetUsers: User[];
        callUser: User | null;
    } => {
        if (meetingCardState === SELF_ACCEPTED) {
            // Self-created meeting that was accepted - target the accepted users
            const targetUserIds = meeting.acceptedUserIds || [];
            const targetUsers = (meeting.acceptedUsers || []) as User[];
            const callUser = targetUsers.length > 0 ? targetUsers[0] : null;
            return { targetUserIds, targetUsers, callUser };
        } else if (meetingCardState === OTHER_ACCEPTED) {
            // Someone else's meeting that we accepted - target the creator
            const targetUserIds = meeting.userFromId ? [meeting.userFromId] : [];
            const targetUsers = meeting.userFrom ? [meeting.userFrom as User] : [];
            const callUser = meeting.userFrom as User | null;
            return { targetUserIds, targetUsers, callUser };
        }

        // Fallback (shouldn't reach here for banner display)
        return { targetUserIds: [], targetUsers: [], callUser: null };
    };

    const { targetUserIds, targetUsers, callUser } = getTargetData();

    // Pulse animation when meeting is happening
    useEffect(() => {
        if (isHappening) {
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.85, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                false
            );
        } else {
            pulseOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [isHappening]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    return (
        <Animated.View
            entering={SlideInDown.springify().damping(15).stiffness(100)}
            style={[styles.container, animatedStyle]}
        >
            <View style={styles.buttonRow}>
                {callUser?.phoneNumber && (
                    <CallUserButton
                        phoneNumber={callUser.phoneNumber}
                        userName={callUser.name}
                        userId={userId}
                        participantId={callUser.id}
                        meetingId={meeting.id}
                        style={styles.callButton}
                        textStyle={styles.callButtonText}
                        showConfirmation={false}
                    />
                )}

                <MiniBroadcastButton
                    targetUserIds={targetUserIds}
                    targetUsers={targetUsers}
                    meetingId={meeting.id}
                    style={styles.broadcastButtonWrapper}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: BURGUNDY,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginTop: -10, // Overlap slightly with card above
        paddingTop: 18,
        paddingBottom: 14,
        paddingHorizontal: 16,
        marginHorizontal: 10,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 10,
    },
    callButton: {
        flex: 1,
        backgroundColor: BOLD_BLUE,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 22,
    },
    callButtonText: {
        color: CREAM,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: CustomFonts.ztnaturemedium,
    },
    broadcastButtonWrapper: {
        flex: 1,
    },
});
