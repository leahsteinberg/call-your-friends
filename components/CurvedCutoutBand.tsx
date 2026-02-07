import { CREAM } from '@/styles/styles';
import { MessageCircle, Share2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface CurvedCutoutBandProps {
    onIcon1Press?: () => void;
    onIcon2Press?: () => void;
    onIcon3Press?: () => void;
    bandColor?: string;
    iconColor?: string;
    visible?: boolean;
}

const BAND_WIDTH = 44;
const CURVE_DEPTH = 30;
const ICON_SIZE = 18;
const ICON_BUTTON_SIZE = 32;

// How far the band shifts when customizing (left and up)
const SHIFT_AMOUNT = 30;

export default function CurvedCutoutBand({
    onIcon1Press,
    onIcon2Press,
    onIcon3Press,
    bandColor = 'rgba(255, 255, 255, 0.15)',
    iconColor = CREAM,
    visible = false,
}: CurvedCutoutBandProps): React.JSX.Element {
    // Symmetrical L-shaped band around the bottom-right corner
    // Both arms extend the same distance from the corner
    const armLength = 100; // How far each arm extends (not including taper)
    const svgSize = armLength + BAND_WIDTH; // Square SVG for symmetry
    const svgWidth = svgSize;
    const svgHeight = svgSize;

    // Animation: slide left and up when customizing, back to default when not
    const slideProgress = useSharedValue(0);

    useEffect(() => {
        slideProgress.value = withSpring(visible ? 1 : 0, {
            damping: 18,
            stiffness: 90,
            mass: 1,
        });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: -slideProgress.value * SHIFT_AMOUNT },
            { translateY: -slideProgress.value * SHIFT_AMOUNT },
        ],
    }));

    // SVG path for L-shaped band with curved tapered edges
    const createLShapePath = () => {
        const curveControl = CURVE_DEPTH;
        const taperLength = 50; // How far the taper extends before reaching full band width
        const cornerRadius = 20; // Match the card's border radius

        // The band has:
        // - Rounded bottom-right corner (matching card)
        // - S-curve at top: single cubic bezier - concave start, convex end approaching card edge vertically
        // - S-curve at left: mirror of top curve
        // - Concave curve at inner corner
        // Going clockwise from top-right:
        return `
            M ${svgWidth} 0
            L ${svgWidth} ${svgHeight - cornerRadius}
            Q ${svgWidth} ${svgHeight} ${svgWidth - cornerRadius} ${svgHeight}
            L 0 ${svgHeight}
            C ${taperLength * 0.5} ${svgHeight} ${taperLength * 0.3} ${svgHeight - BAND_WIDTH} ${taperLength} ${svgHeight - BAND_WIDTH}
            L ${svgWidth - BAND_WIDTH - curveControl} ${svgHeight - BAND_WIDTH}
            Q ${svgWidth - BAND_WIDTH} ${svgHeight - BAND_WIDTH} ${svgWidth - BAND_WIDTH} ${svgHeight - BAND_WIDTH - curveControl}
            L ${svgWidth - BAND_WIDTH} ${taperLength}
            C ${svgWidth - BAND_WIDTH} ${taperLength * 0.3} ${svgWidth} ${taperLength * 0.5} ${svgWidth} 0
            Z
        `;
    };

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {/* SVG curved background */}
            <Svg
                width={svgWidth}
                height={svgHeight}
                style={styles.svgBackground}
            >
                <Path
                    d={createLShapePath()}
                    fill={bandColor}
                />
            </Svg>

            {/* Icon buttons - arranged along the L-shape */}
            <Animated.View style={styles.iconsContainer}>
                {/* Icon at the corner */}
                <TouchableOpacity
                    style={[styles.iconButton, styles.iconCorner]}
                    onPress={onIcon2Press}
                    activeOpacity={0.7}
                >
                    <MessageCircle size={ICON_SIZE} color={iconColor} />
                </TouchableOpacity>

                {/* Icon on the horizontal part (bottom) */}
                <TouchableOpacity
                    style={[styles.iconButton, styles.iconBottom]}
                    onPress={onIcon3Press}
                    activeOpacity={0.7}
                >
                    <Share2 size={ICON_SIZE} color={iconColor} />
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const SVG_SIZE = 100 + BAND_WIDTH; // armLength + BAND_WIDTH = 144

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: -30,
        bottom: -30,
        width: SVG_SIZE,
    },
    svgBackground: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    iconsContainer: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: SVG_SIZE,
        height: SVG_SIZE,
    },
    iconButton: {
        position: 'absolute',
        width: ICON_BUTTON_SIZE,
        height: ICON_BUTTON_SIZE,
        borderRadius: ICON_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            },
        }),
    },
    // Position icons symmetrically along the L-shape
    iconTop: {
        right: 6,
        top: 30,
    },
    iconCorner: {
        right: 6,
        bottom: 50,
    },
    iconBottom: {
        left: 50,
        bottom: 6,
    },
});
