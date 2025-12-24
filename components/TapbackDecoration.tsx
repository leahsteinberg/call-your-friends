import { BOLD_BLUE, CREAM } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
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

interface TapbackDecorationProps {
    selectedTapback: string | null;
    size?: number;
    iconSize?: number;
    top?: number;
    right?: number;
}

/**
 * TapbackDecoration - iMessage-style reaction bubble
 *
 * Displays a selected tapback icon in a small circular bubble,
 * positioned to overlap the parent container (like iMessage reactions).
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
}: TapbackDecorationProps): React.JSX.Element | null {
    if (!selectedTapback) return null;

    const TapbackIcon = TAPBACK_ICONS[selectedTapback];
    if (!TapbackIcon) return null;

    return (
        <View
            style={[
                styles.tapbackBubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    top,
                    right,
                },
            ]}
        >
            <TapbackIcon width={iconSize} height={iconSize} fill={BOLD_BLUE} />
        </View>
    );
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
});
