import { CustomFonts } from "@/constants/theme";
import { BURGUNDY, CREAM, ORANGE, PALE_BLUE } from "@/styles/styles";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";


// Tapback word options
const VIBE_WORDS = [
    { id: 'hi', text: 'Just Saying Hi!', label: 'Just Saying Hi' },
    { id: 'catchup', text: 'Catch Up', label: 'Catch up' },
    { id: 'miss', text: 'Miss You!', label: 'Miss you' },
    { id: 'yap', text: 'Yap Time', label: 'Yap' },
];

interface VibeButtonProps {
    selectedVibe: string | null;
    onVibeSelect?: (vibeId: string | null) => void;
    displayOnly?: boolean; // If true, button is disabled and only displays the current vibe
}

export default function VibeButton({
    selectedVibe,
    onVibeSelect=undefined,
    displayOnly = false
}: VibeButtonProps): React.JSX.Element {
    const [showModal, setShowModal] = useState(false);


    const modalTranslateY = useSharedValue(30); // Start 30px below final position
    const modalOpacity = useSharedValue(0); // Start transparent

    // Trigger animation when modal appears
    useEffect(() => {
        if (showModal) {
            // Popup animation - reset to starting position
            modalTranslateY.value = 30;
            modalOpacity.value = 0;

            modalTranslateY.value = withTiming(1, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
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
        onVibeSelect?.(vibeId);
        setShowModal(false);
    };

    // Get button text based on selected vibe
    const getButtonText = () => {
        if (!selectedVibe) {
            return "+ PICK A CALL VIBE";
        }

        const word = VIBE_WORDS.find(w => w.id === selectedVibe);
        return `${word?.text.toUpperCase()}` || "+ PICK A CALL VIBE";
    };

    const hasVibe = !!selectedVibe;

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.vibeButton,
                    hasVibe ? styles.vibeButtonFilled : styles.vibeButtonEmpty,
                    displayOnly && styles.vibeButtonDisabled
                ]}
                onPress={handleButtonPress}
                activeOpacity={displayOnly ? 1 : 0.7}
                disabled={displayOnly}
            >
                <Text style={[
                    styles.vibeButtonText,
                    hasVibe ? styles.vibeButtonTextFilled : styles.vibeButtonTextEmpty
                ]}>
                    {getButtonText()}
                </Text>
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
                            {(
                                VIBE_WORDS.map((word) => (
                                    <TouchableOpacity
                                        key={word.id}
                                        style={styles.vibeWordButton}
                                        onPress={() => handleVibeSelect(word.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.vibeWordText}>{word.text}</Text>
                                    </TouchableOpacity>
                                ))
                            ) }

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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    vibeButtonEmpty: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: CREAM,
        borderStyle: "dotted",
    },
    vibeButtonFilled: {
        backgroundColor: PALE_BLUE,
        borderWidth: 2,
        borderColor: CREAM,
        borderStyle: 'solid',
    },
    vibeButtonDisabled: {
        opacity: 0.85,
    },
    vibeButtonText: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    vibeButtonTextEmpty: {
        color: CREAM,
        opacity: 0.8,
        fontWeight: '500',
    },
    vibeButtonTextFilled: {
        color: BURGUNDY,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flexDirection: 'column',
        alignItems: 'center',
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
        //backgroundColor: 'transparent',
    },
    vibeWordButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: PALE_BLUE,

        //backgroundColor: 'transparent',
    },
    vibeWordText: {
        color: BURGUNDY,
        fontSize: 13,
        fontWeight: '600',

    },
    separator: {
        width: 1,
        backgroundColor: ORANGE,
        opacity: 0.2,
        marginHorizontal: 4,
    },
    noneButton: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noneButtonText: {
        color: BURGUNDY,
        fontSize: 14,
        fontWeight: '600',
    },
});
