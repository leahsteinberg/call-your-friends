import { CREAM } from '@/styles/styles';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CurvedCutoutBandProps {
    onIcon1Press?: () => void;
    onIcon2Press?: () => void;
    onIcon3Press?: () => void;
    bandColor?: string;
    iconColor?: string;
    cardHeight?: number;
}

const BAND_WIDTH = 50;
const CURVE_RADIUS = 30;
const ICON_SIZE = 22;
const ICON_BUTTON_SIZE = 38;

export default function CurvedCutoutBand({
    onIcon1Press,
    onIcon2Press,
    onIcon3Press,
    bandColor = 'rgba(255, 255, 255, 0.15)',
    iconColor = CREAM,
    cardHeight = 180,
}: CurvedCutoutBandProps): React.JSX.Element {
    // SVG path for the curved cutout shape
    // This creates a vertical band with a concave curve on the left side
    const createCutoutPath = () => {
        const width = BAND_WIDTH;
        const height = cardHeight;
        const curveDepth = CURVE_RADIUS;
        const curveStart = height * 0.15; // Start curve 15% from top
        const curveEnd = height * 0.85;   // End curve 85% from top

        // Path: start top-left, go right, down the right side,
        // then create a concave curve on the left side going back up
        return `
            M 0 0
            L ${width} 0
            L ${width} ${height}
            L 0 ${height}
            L 0 ${curveEnd}
            Q ${curveDepth} ${height * 0.5} 0 ${curveStart}
            L 0 0
            Z
        `;
    };

    return (
        <View style={[styles.container, { height: cardHeight }]}>
            {/* SVG curved background */}
            <Svg
                width={BAND_WIDTH}
                height={cardHeight}
                style={styles.svgBackground}
            >
                <Path
                    d={createCutoutPath()}
                    fill={bandColor}
                />
            </Svg>

            {/* Icon buttons container */}
            <View style={styles.iconsContainer}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onIcon1Press}
                    activeOpacity={0.7}
                >
                    <Heart size={ICON_SIZE} color={iconColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onIcon2Press}
                    activeOpacity={0.7}
                >
                    <MessageCircle size={ICON_SIZE} color={iconColor} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onIcon3Press}
                    activeOpacity={0.7}
                >
                    <Share2 size={ICON_SIZE} color={iconColor} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: BAND_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    svgBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    iconsContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingRight: 6,
    },
    iconButton: {
        width: ICON_BUTTON_SIZE,
        height: ICON_BUTTON_SIZE,
        borderRadius: ICON_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
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
});
