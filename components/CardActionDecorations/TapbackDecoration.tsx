import { BOLD_BLUE, CREAM } from "@/styles/styles";
import { CustomFonts } from "@/constants/theme";
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

// Import tapback SVG icons
import BirdSoaring from "@/assets/images/bird-soaring.svg";
import ClapBurst from "@/assets/images/clap-burst.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";
import PaperAirplane from "@/assets/images/paper-airplane.svg";
import StarPerson from "@/assets/images/star-person.svg";

// Tapback icon mapping
const TAPBACK_ICONS: Record<string, any> = {
    bird: BirdSoaring,
    clap: ClapBurst,
    star: HighFiveStar,
    airplane: PaperAirplane,
    person: StarPerson,
};

// Tapback word mapping
const TAPBACK_WORDS: Record<string, string> = {
    hi: 'Just Hi',
    catchup: 'Catch Up',
    miss: 'Miss You',
    yap: 'Yap Time',
};

interface TapbackDecorationProps {
    selectedTapback: string | null;
    size?: number;
    iconSize?: number;
    top?: number;
    right?: number;
    useWords?: boolean; // If true, displays word instead of icon
}

/**
 * TapbackDecoration - iMessage-style reaction bubble
 *
 * Displays a selected tapback icon in a small circular bubble,
 * positioned to overlap the parent container (like iMessage reactions).
 * Includes a fun pop animation when it appears.
 *
 * Usage:
 * ```tsx
 * <View style={{ position: 'relative' }}>
 *   <TapbackDecoration selectedTapback="star" />
 *   <YourCardContent />
 * </View>
 * ```
 */
export default function TapbackDecoration({
    selectedTapback,
    size = 36,
    iconSize = 20,
    top = -10,
    right = -10,
    useWords = false,
}: TapbackDecorationProps): React.JSX.Element | null {
    // Animation values
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    // Trigger pop animation when tapback appears
    useEffect(() => {
        if (selectedTapback) {
            // Reset to starting values
            scale.value = 0;
            opacity.value = 0;

            // Pop animation - bouncy scale with slight overshoot
            scale.value = withSpring(1, {
                damping: 10,
                stiffness: 250,
                overshootClamping: false, // Allow bounce over 1.0 for fun effect
            });

            // Fade in
            opacity.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
            });
        }
    }, [selectedTapback]);

    // Create animated style
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    if (!selectedTapback) return null;

    // Check if we're using words or icons
    if (useWords) {
        const tapbackText = TAPBACK_WORDS[selectedTapback];
        if (!tapbackText) return null;

        return (
            <Animated.View
                style={[
                    styles.tapbackBubble,
                    styles.tapbackWordBubble,
                    {
                        top,
                        right,
                    },
                    animatedStyle,
                ]}
            >
                <Text style={styles.tapbackWordText}>{tapbackText}</Text>
            </Animated.View>
        );
    } else {
        const TapbackIcon = TAPBACK_ICONS[selectedTapback];
        if (!TapbackIcon) return null;

        return (
            <Animated.View
                style={[
                    styles.tapbackBubble,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        top,
                        right,
                    },
                    animatedStyle,
                ]}
            >
                <TapbackIcon width={iconSize} height={iconSize} fill={BOLD_BLUE} />
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    tapbackBubble: {
        position: 'absolute',
        backgroundColor: CREAM,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
        borderWidth: 2,
        borderColor: BOLD_BLUE,
    },
    tapbackWordBubble: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        height: 'auto',
        width: 'auto',
    },
    tapbackWordText: {
        fontSize: 12,
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
});
