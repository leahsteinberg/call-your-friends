import { BOLD_BLUE, CREAM } from "@/styles/styles";
import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

// Import SVG icons for tapback
import BirdSoaring from "@/assets/images/bird-soaring.svg";
import ClapBurst from "@/assets/images/clap-burst.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";
import PaperAirplane from "@/assets/images/paper-airplane.svg";
import StarPerson from "@/assets/images/star-person.svg";

// Tapback icon options
const TAPBACK_ICONS = [
    { id: 'bird', Component: BirdSoaring, label: 'Bird' },
    { id: 'clap', Component: ClapBurst, label: 'Clap' },
    { id: 'star', Component: HighFiveStar, label: 'Star' },
    { id: 'airplane', Component: PaperAirplane, label: 'Airplane' },
    { id: 'person', Component: StarPerson, label: 'Person' },
];

interface VibeTapBackProps {
    children: React.ReactNode;
    onTapbackSelect: (iconId: string, cardData?: any) => void;
    cardData?: any; // Data to pass back with the callback (e.g., meeting.id)
}

/**
 * VibeTapBack - Reusable tapback component for event cards
 *
 * Wraps card content with long-press gesture detection and shows a popup
 * with reaction icons similar to iMessage's tapback feature.
 *
 * Usage:
 * ```tsx
 * <VibeTapBack onTapbackSelect={handleTapback} cardData={meeting.id}>
 *   <View>Your card content here</View>
 * </VibeTapBack>
 * ```
 */
export default function VibeTapBack({ children, onTapbackSelect, cardData }: VibeTapBackProps): React.JSX.Element {
    const [showTapback, setShowTapback] = useState(false);
    const [tapbackPosition, setTapbackPosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef<View>(null);

    // Animation values for tapback popup
    const tapbackTranslateY = useSharedValue(30); // Start 30px below final position
    const tapbackOpacity = useSharedValue(0);

    // Trigger animation when tapback popup appears
    useEffect(() => {
        if (showTapback) {
            // Reset to starting position
            tapbackTranslateY.value = 30;
            tapbackOpacity.value = 0;

            // Animate in with spring - slides up and fades in
            tapbackTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 200,
            });
            tapbackOpacity.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
            });
        }
    }, [showTapback]);

    // Create animated style for popup
    const animatedPopupStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: tapbackTranslateY.value }],
        opacity: tapbackOpacity.value,
    }));

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
        onTapbackSelect(iconId, cardData);
        setShowTapback(false);
    };

    // Create long press gesture (500ms duration)
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            handleLongPress();
        });

    return (
        <>
            <GestureDetector gesture={longPressGesture}>
                <View ref={cardRef}>
                    {children}
                </View>
            </GestureDetector>

            {/* Tapback Popup Modal */}
            <Modal
                visible={showTapback}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowTapback(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowTapback(false)}>
                    <View style={styles.tapbackOverlay}>
                        <Animated.View
                            style={[
                                styles.tapbackContainer,
                                {
                                    position: 'absolute',
                                    left: tapbackPosition.x - 150, // Center the popup (300px width / 2)
                                    top: tapbackPosition.y,
                                },
                                animatedPopupStyle,
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
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
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
