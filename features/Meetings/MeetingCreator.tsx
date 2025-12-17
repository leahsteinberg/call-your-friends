import { useCreateMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_GREEN, CREAM, DARK_GREEN, LIGHT_BEIGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";
import UnifiedDateTimePicker from "./UnifiedDateTimePicker";
import { displayDateTime } from "./meetingsUtils";
import { FUTURE_TIME_TYPE, OPEN_TARGET_TYPE, USER_INTENT_SOURCE_TYPE } from "./types";

// refreshMeetings is now optional - cache tags auto-refetch when createMeeting invalidates 'Meeting' tag
export default function MeetingCreator({refreshMeetings, onSuccess}: {refreshMeetings?: () => void; onSuccess?: () => void}) {
    const { height, width } = useWindowDimensions();
    const [createMeeting] = useCreateMeetingMutation();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [displayDateString, setDisplayDateString] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedHeight, {
            toValue: isExpanded ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    }, [isExpanded]);

    const handleDateTimeSelect = async (dateTime: Date) => {
        setSelectedDateTime(dateTime);
        const displayString = await displayDateTime(dateTime.toISOString());
        setDisplayDateString(displayString);
    };

    const handleCreateMeeting = async () => {
        if (!selectedDateTime) {
            alert('Please select a date and time first');
            return;
        }

        const scheduledFor = selectedDateTime.toISOString();
        const scheduledEnd = new Date(selectedDateTime);
        scheduledEnd.setHours(scheduledEnd.getHours() + 1);
        console.log("REGULAR create -", scheduledFor);

        setIsCreating(true);
        try {
            await createMeeting({
                userFromId: userId,
                scheduledFor,
                scheduledEnd: scheduledEnd.toISOString(),
                targetType: OPEN_TARGET_TYPE,
                timeType: FUTURE_TIME_TYPE,
                sourceType: USER_INTENT_SOURCE_TYPE,
            }).unwrap();

            // Success! Show success feedback
            setIsCreating(false);
            setShowSuccess(true);

            // Animate success message
            Animated.timing(successOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-hide after 1.5 seconds and call onSuccess
            setTimeout(() => {
                Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setShowSuccess(false);
                    setSelectedDateTime(null);
                    setDisplayDateString('');
                    onSuccess?.();
                });
            }, 1500);
        } catch (error) {
            console.error("Error creating meeting:", error);
            setIsCreating(false);
            alert('Failed to create meeting. Please try again.');
        }
    };
    
    // On iOS, make it collapsible; on other platforms, always show expanded
    const shouldUseCollapsible = Platform.OS === 'ios';

    const maxHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500], // Adjust max height as needed
    });

    const opacity = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={[styles.container]}>
            {/* Success Overlay */}
            {showSuccess && (
                <Animated.View
                    style={[
                        styles.successOverlay,
                        { opacity: successOpacity }
                    ]}
                >
                    <Check color={BRIGHT_GREEN} size={48} strokeWidth={3} />
                    <Text style={styles.successText}>Meeting Created!</Text>
                </Animated.View>
            )}

            <TouchableOpacity
                style={styles.titleContainer}
                onPress={() => shouldUseCollapsible && setIsExpanded(!isExpanded)}
                disabled={!shouldUseCollapsible}
            >
                <Text style={styles.title}>When are you free to chat?</Text>
                {shouldUseCollapsible && (
                    isExpanded ?
                        <ChevronDown color={DARK_GREEN} size={24} /> :
                        <ChevronUp color={DARK_GREEN} size={24} />
                )}
            </TouchableOpacity>

            {shouldUseCollapsible ? (
                <Animated.View
                    style={{
                        maxHeight,
                        opacity,
                        overflow: 'hidden',
                    }}
                >
                    <UnifiedDateTimePicker
                        onDateTimeSelect={handleDateTimeSelect}
                        selectedDateTime={selectedDateTime || undefined}
                    />
                    { selectedDateTime && (
                        <TouchableOpacity
                            style={[styles.createButton, (!selectedDateTime || isCreating) && styles.disabledButton]}
                            onPress={handleCreateMeeting}
                            disabled={!selectedDateTime || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color={CREAM} />
                            ) : (
                                <>
                                    <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                                        Find a friend to talk on:
                                    </Text>
                                    <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                                        {displayDateString && `${displayDateString}`}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        )
                    }
                </Animated.View>
            ) : (
                <>
                    <UnifiedDateTimePicker
                        onDateTimeSelect={handleDateTimeSelect}
                        selectedDateTime={selectedDateTime || undefined}
                    />
                    { selectedDateTime && (
                        <TouchableOpacity
                            style={[styles.createButton, (!selectedDateTime || isCreating) && styles.disabledButton]}
                            onPress={handleCreateMeeting}
                            disabled={!selectedDateTime || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color={CREAM} />
                            ) : (
                                <>
                                    <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                                        Find a friend to talk on:
                                    </Text>
                                    <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                                        {displayDateString && `${displayDateString}`}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                        )
                    }
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: LIGHT_BEIGE,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 15,
        shadowColor: PALE_BLUE,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'relative',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DARK_GREEN,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: DARK_GREEN,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        minHeight: 48,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    buttonText: {
        color: CREAM,
        fontSize: 20,
        fontWeight: '500',
    },
    disabledButtonText: {
        color: '#666',
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: CREAM,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        gap: 12,
    },
    successText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
    },
});


