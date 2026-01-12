import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

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

// Tapback word options
const TAPBACK_WORDS = [
    { id: 'hi', text: 'Just Hi', label: 'Hi' },
    { id: 'catchup', text: 'Catch Up', label: 'Catch up' },
    { id: 'miss', text: 'Miss You', label: 'Miss you' },
    { id: 'yap', text: 'Yap Time', label: 'Yap' },
];

interface VibeButtonProps {
    selectedVibe: string | null;
    onVibeSelect: (vibeId: string | null) => void;
    useWords?: boolean; // If true, shows word options instead of SVG icons
    displayOnly?: boolean; // If true, button is disabled and only displays the current vibe
}

/**
 * VibeButton - Reusable vibe selection button component for event cards
 *
 * Displays a button that opens a modal with vibe/reaction options.
 * When no vibe is selected, shows "Add a Vibe".
 * When a vibe is selected, shows the selected vibe text.
 *
 * Usage:
 * ```tsx
 * const [vibe, setVibe] = useState<string | null>(null);
 *
 * <VibeButton
 *   selectedVibe={vibe}
 *   onVibeSelect={setVibe}
 *   useWords={true}
 * />
 * ```
 */
export default function VibeButton({
    selectedVibe,
    onVibeSelect,
    useWords = false,
    displayOnly = false
}: VibeButtonProps): React.JSX.Element {
    const [showModal, setShowModal] = useState(false);

    // Choose which set of options to display
    const vibeOptions = useWords ? TAPBACK_WORDS : TAPBACK_ICONS;

    // Animation values for modal popup
    const modalTranslateY = useSharedValue(30); // Start 30px below final position
    const modalOpacity = useSharedValue(0); // Start transparent

    // Trigger animation when modal appears
    useEffect(() => {
        if (showModal) {
            // Popup animation - reset to starting position
            modalTranslateY.value = 30;
            modalOpacity.value = 0;

            // Animate popup in - slides up with spring, fades in linearly
            modalTranslateY.value = withSpring(0, {
                damping: 15,
                stiffness: 200,
            });
            modalOpacity.value = withTiming(1, {
                duration: 200,
                easing: Easing.linear,
            });
        }
    }, [showModal]);

    // Create animated style for popup
    const animatedPopupStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: modalTranslateY.value }],
        opacity: modalOpacity.value,
    }));

    // Handle button press to show modal
    const handleButtonPress = () => {
        if (!displayOnly) {
            setShowModal(true);
        }
    };

    // Handle vibe selection
    const handleVibeSelect = (vibeId: string | null) => {
        onVibeSelect(vibeId);
        setShowModal(false);
    };

    // Get button text based on selected vibe
    const getButtonText = () => {
        if (!selectedVibe) {
            return "Add a Vibe";
        }

        if (useWords) {
            const word = TAPBACK_WORDS.find(w => w.id === selectedVibe);
            return word?.text || "Add a Vibe";
        } else {
            const icon = TAPBACK_ICONS.find(i => i.id === selectedVibe);
            return icon?.label || "Add a Vibe";
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.vibeButton,
                    displayOnly && styles.vibeButtonDisabled
                ]}
                onPress={handleButtonPress}
                activeOpacity={displayOnly ? 1 : 0.7}
                disabled={displayOnly}
            >
                <Text style={styles.vibeButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>

            {/* Vibe Selection Modal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                animatedPopupStyle,
                            ]}
                        >
                            {useWords ? (
                                // Word-based vibes
                                TAPBACK_WORDS.map((word) => (
                                    <TouchableOpacity
                                        key={word.id}
                                        style={styles.vibeWordButton}
                                        onPress={() => handleVibeSelect(word.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.vibeWordText}>{word.text}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                // Icon-based vibes
                                TAPBACK_ICONS.map((icon) => (
                                    <TouchableOpacity
                                        key={icon.id}
                                        style={styles.vibeIcon}
                                        onPress={() => handleVibeSelect(icon.id)}
                                        activeOpacity={0.7}
                                    >
                                        <icon.Component
                                            width={40}
                                            height={40}
                                            fill={BOLD_BLUE}
                                        />
                                    </TouchableOpacity>
                                ))
                            )}

                            {/* Separator */}
                            <View style={styles.separator} />

                            {/* None button to clear vibe */}
                            <TouchableOpacity
                                style={styles.noneButton}
                                onPress={() => handleVibeSelect(null)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.noneButtonText}>None</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    vibeButton: {
        backgroundColor: PALE_BLUE,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: BOLD_BLUE,
    },
    vibeButtonDisabled: {
        opacity: 0.7,
    },
    vibeButtonText: {
        color: BOLD_BLUE,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: CustomFonts.ztnaturebold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
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
    vibeIcon: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'transparent',
    },
    vibeWordButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    vibeWordText: {
        color: BOLD_BLUE,
        fontSize: 13,
        fontWeight: '600',
    },
    separator: {
        width: 1,
        backgroundColor: BOLD_BLUE,
        opacity: 0.2,
        marginHorizontal: 4,
    },
    noneButton: {
        width: 60,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'transparent',
    },
    noneButtonText: {
        color: BOLD_BLUE,
        fontSize: 14,
        fontWeight: '600',
    },
});
