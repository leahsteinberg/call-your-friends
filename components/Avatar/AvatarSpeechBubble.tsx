import { VIBE_WORDS } from '@/components/CardActionDecorations/VibeButton';
import { CustomFonts } from '@/constants/theme';
import { BURGUNDY, CREAM, FUN_PURPLE, PALE_BLUE } from '@/styles/styles';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAvatarContext } from './Avatar';

interface SpeechBubbleProps {
    selectedVibe?: string | null;
    onVibeSelect?: (vibeId: string | null) => void;
    displayOnly?: boolean;
}

export function SpeechBubble({
    selectedVibe = null,
    onVibeSelect,
    displayOnly = false,
}: SpeechBubbleProps): React.JSX.Element | null {
    const { size } = useAvatarContext();
    const [showModal, setShowModal] = useState(false);

    const vibeWord = selectedVibe ? VIBE_WORDS.find(w => w.id === selectedVibe) : null;
    const hasVibe = !!vibeWord;

    if (displayOnly && !hasVibe) return null;

    const handlePress = () => {
        if (!displayOnly) setShowModal(true);
    };

    const handleVibeSelect = (vibeId: string | null) => {
        onVibeSelect?.(vibeId);
        setShowModal(false);
    };

    const tailSize = 6;

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={displayOnly ? 1 : 0.7}
                disabled={displayOnly}
                style={{
                    position: 'absolute',
                    top: -size * (hasVibe ? 0.08 : .12),
                    left: -size * (hasVibe ? 0.2 : 0.1),
                    transform: [{ rotate: '-15deg' }],
                    zIndex: 10,
                }}
            >
                <View style={{
                    backgroundColor: hasVibe ? CREAM : FUN_PURPLE,
                    borderRadius: 10,
                    paddingHorizontal: hasVibe ? 6 : 5,
                    paddingVertical: hasVibe ? 3 : 4,
                    minWidth: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    elevation: 3,
                }}>
                    {hasVibe ? (
                        <Text style={{ fontSize: 10, fontFamily: CustomFonts.ztnaturebold, color: BURGUNDY, fontWeight: '700' }}>
                            {vibeWord.label}
                        </Text>
                    ) : (
                        <Text style={{ fontSize: 14, fontWeight: '700', color: CREAM }}>
                            {` + `}
                        </Text>
                    )}
                </View>
                <View style={{
                    position: 'absolute',
                    bottom: -tailSize + 1,
                    right: 4,
                    left: hasVibe ? 15 : 10,
                    width: 0,
                    height: -15,
                    borderLeftWidth: tailSize,
                    borderRightWidth: 0,
                    borderTopWidth: tailSize,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: hasVibe ? CREAM : FUN_PURPLE,
                }} />
            </TouchableOpacity>

            {!displayOnly && (
                <Modal
                    visible={showModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowModal(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                {VIBE_WORDS.map((word) => (
                                    <TouchableOpacity
                                        key={word.id}
                                        style={styles.vibeOption}
                                        onPress={() => handleVibeSelect(word.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.vibeOptionText}>{word.text}</Text>
                                    </TouchableOpacity>
                                ))}
                                <View style={styles.separator} />
                                <TouchableOpacity
                                    style={styles.noneButton}
                                    onPress={() => handleVibeSelect(null)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.noneButtonText}>None</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        gap: 8,
    },
    vibeOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: PALE_BLUE,
    },
    vibeOptionText: {
        color: BURGUNDY,
        fontSize: 13,
        fontWeight: '600',
    },
    separator: {
        width: 40,
        height: 1,
        backgroundColor: BURGUNDY,
        opacity: 0.15,
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
