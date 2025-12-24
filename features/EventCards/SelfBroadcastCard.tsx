import AnimatedText from "@/components/AnimatedText";
import { eventCardText } from "@/constants/event_card_strings";
import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { useBroadcastEndMutation } from "@/services/meetingApi";
import { BOLD_BLUE, BOLD_BROWN, BURGUNDY, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast } from "../Broadcast/broadcastSlice";
import { addMeetingRollback, deleteMeetingOptimistic } from "../Meetings/meetingSlice";
import type { MeetingState, ProcessedMeetingType } from "../Meetings/types";

// Import SVG icons for tapback
import BirdSoaring from "@/assets/images/bird-soaring.svg";
import ClapBurst from "@/assets/images/clap-burst.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";
import PaperAirplane from "@/assets/images/paper-airplane.svg";
import StarPerson from "@/assets/images/star-person.svg";

interface SelfBroadcastCardProps {
    meeting: ProcessedMeetingType;
}

// Tapback icon options
const TAPBACK_ICONS = [
    { id: 'bird', Component: BirdSoaring, label: 'Bird' },
    { id: 'clap', Component: ClapBurst, label: 'Clap' },
    { id: 'star', Component: HighFiveStar, label: 'Star' },
    { id: 'airplane', Component: PaperAirplane, label: 'Airplane' },
    { id: 'person', Component: StarPerson, label: 'Person' },
];

// Card for self-created broadcast meetings
export default function SelfBroadcastCard({ meeting }: SelfBroadcastCardProps): React.JSX.Element {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [endBroadcastRequest] = useBroadcastEndMutation();
    const [isEnding, setIsEnding] = useState(false);
    const [showTapback, setShowTapback] = useState(false);
    const [tapbackPosition, setTapbackPosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<View>(null);

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

    // Handle long press to show tapback
    const handleLongPress = () => {
        cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
            // Position popup above the card
            setTapbackPosition({
                x: pageX + width / 2,
                y: pageY - 60, // 60px above the card
            });
            setShowTapback(true);
        });
    };

    // Handle tapback icon selection
    const handleTapbackSelect = (iconId: string) => {
        console.log(`Tapback selected: ${iconId} for meeting ${meeting.id}`);
        // TODO: Implement tapback functionality
        // This is where you'll add the logic to send the tapback to the server
        // or update the UI with the selected reaction
        setShowTapback(false);
    };

    // Create long press gesture
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            handleLongPress();
        });


    return (
        <>
            <GestureDetector gesture={longPressGesture}>
                <View style={styles.outerContainer} ref={cardRef}>

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
            </GestureDetector>

            {/* Tapback Popup Modal */}
            <Modal
                visible={showTapback}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTapback(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowTapback(false)}>
                    <View style={styles.tapbackOverlay}>
                        <View
                            style={[
                                styles.tapbackContainer,
                                {
                                    position: 'absolute',
                                    left: tapbackPosition.x - 150, // Center the popup (300px width / 2)
                                    top: tapbackPosition.y,
                                }
                            ]}
                        >
                            {TAPBACK_ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon.id}
                                    style={styles.tapbackIcon}
                                    onPress={() => handleTapbackSelect(icon.id)}
                                    activeOpacity={0.7}
                                >
                                    <icon.Component
                                        width={40}
                                        height={40}
                                        fill={BOLD_BLUE}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: CARD_LOWER_MARGIN,

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
    // Tapback styles
    tapbackOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    tapbackContainer: {
        flexDirection: 'row',
        backgroundColor: CREAM,
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        gap: 8,
    },
    tapbackIcon: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'transparent',
    },
});
