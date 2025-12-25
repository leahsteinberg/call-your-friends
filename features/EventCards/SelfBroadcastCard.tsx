import AnimatedText from "@/components/AnimatedText";
import TapbackDecoration from "@/components/TapbackDecoration";
import VibeTapBack from "@/components/VibeTapBack";
import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BOLD_BROWN, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
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
    const [selectedTapback, setSelectedTapback] = useState<string | null>(null);

    const meetingState: MeetingState = meeting.meetingState;
    const strings = eventCardText.broadcast_self_open;

    // Get the name to display
    const getOtherUserName = () => {
        if (meeting.acceptedUser) {
            return meeting.acceptedUser?.name;
        }
    }

    // Handle tapback selection
    const handleTapback = (iconId: string | null, cardData?: any) => {
        console.log(`Tapback selected: ${iconId} for meeting ${cardData}`);
        setSelectedTapback(iconId);
        // TODO: Send tapback to server
    };

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
        <VibeTapBack onTapbackSelect={handleTapback} cardData={meeting.id} useWords={true}>
            <View style={styles.outerContainer}>
                        {/* Tapback decoration in top-right corner */}
                        <TapbackDecoration selectedTapback={selectedTapback} />

                        <View style={styles.container}>
                            <View style={styles.header}>
                                <View style={styles.searchingContainer}>
                                        <Text style={styles.searchingText}>{strings.mainText!()}</Text>
                                        <AnimatedText
                                            text="..."
                                            style={styles.searchingText}
                                            duration={300}
                                            staggerDelay={500}
                                        />
                                </View>
                                <TouchableOpacity
                                    onPress={handleCancelMeeting}
                                    style={[styles.endBroadcastButton, isEnding && styles.endBroadcastButtonDisabled]}
                                    disabled={isEnding}
                                >
                                    <View style={styles.buttonContainer}>
        
                                        {isEnding ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (

                                            <Text style={styles.endBroadcastButtonText}>{strings.acceptButtonText!()}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>


                            </View>

                            <View>
                                <Text style={styles.statusText}>{strings.subtext!(getOtherUserName())}</Text>
                                <View >
                                    <Text style={styles.descriptionText}>{strings.title!()}</Text>
                                </View>
                            </View>
                            {/* <View style={styles.circleContainerRelative}>
                                <ConcentricCircles isActive={true} primaryColor={BOLD_BLUE} secondaryColor={CREAM}/>
                            </View> */}
                            {DEV_FLAG && (
                                <Text style={styles.debugText}>ID: {meeting.id.substring(0, 4)}</Text>
                            )}
                        </View>
                </View>
        </VibeTapBack>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,
        position: 'relative', // Enable absolute positioning for TapbackDecoration
    },
    container: {
        backgroundColor: BOLD_BLUE,
        borderRadius: 8,
        padding: 20,
        overflow: 'hidden', // Clip circles that extend beyond card
        minHeight: CARD_MIN_HEIGHT,
    },
    descriptionText: {
        fontSize: 20,
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.8,
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
        //backgroundColor: PALE_BLUE,
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
        fontSize: 28,
        fontWeight: '600',
        color: CREAM,
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
