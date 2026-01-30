import { CREAM } from "@/styles/styles";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// CONFIGURATION - Edit these to customize the gradient behavior
// ============================================================================

export type GradientMode = "slow" | "fast";

interface LayerConfig {
    id: string;
    colors: {
        inner: string;
        middle: string;
        outer: string;
    };
    position: {
        cx: number; // 0-1 percentage of screen width
        cy: number; // 0-1 percentage of screen height
    };
    size: {
        rx: number; // 0-1 percentage of screen width
        ry: number; // 0-1 percentage of screen height
    };
    animation: {
        // Circular drift animation - layer moves in a circle
        driftRadius: number; // How far the layer drifts (pixels)
        driftDuration: number; // How long one full circle takes (ms)
        driftDirection: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
        // Opacity pulsing
        opacityDuration: number; // ms
        opacityRange: [number, number]; // [min, max]
        // Scale pulsing for extra organic feel
        scaleDuration: number; // ms
        scaleRange: [number, number]; // [min, max]
    };
}

interface ModeConfig {
    layers: LayerConfig[];
}

const GRADIENT_MODES: Record<GradientMode, ModeConfig> = {
    slow: {
        layers: [
            {
                id: "greenBlob",
                colors: {
                    inner: "#a8d94a",
                    middle: "#b8e35a",
                    outer: "#d0f080",
                },
                position: { cx: 0.5, cy: 0.85 },
                size: { rx: 1.2, ry: 0.7 },
                animation: {
                    driftRadius: 30,
                    driftDuration: 25000,
                    driftDirection: 1,
                    opacityDuration: 6000,
                    opacityRange: [0.6, 0.85],
                    scaleDuration: 8000,
                    scaleRange: [0.95, 1.05],
                },
            },
            {
                id: "tealBlob",
                colors: {
                    inner: "#5da7e6",
                    middle: "#7dc4c0",
                    outer: "#a0ddd0",
                },
                position: { cx: 0.2, cy: 0.9 },
                size: { rx: 0.85, ry: 0.55 },
                animation: {
                    driftRadius: 40,
                    driftDuration: 30000,
                    driftDirection: -1,
                    opacityDuration: 7000,
                    opacityRange: [0.4, 0.7],
                    scaleDuration: 9000,
                    scaleRange: [0.92, 1.08],
                },
            },
            {
                id: "blueBlob",
                colors: {
                    inner: "#60a2ee",
                    middle: "#80c0f0",
                    outer: "#b0e0f8",
                },
                position: { cx: 0.8, cy: 0.88 },
                size: { rx: 0.8, ry: 0.52 },
                animation: {
                    driftRadius: 35,
                    driftDuration: 22000,
                    driftDirection: 1,
                    opacityDuration: 5000,
                    opacityRange: [0.35, 0.65],
                    scaleDuration: 7000,
                    scaleRange: [0.93, 1.07],
                },
            },
            {
                id: "chartreuseAccent",
                colors: {
                    inner: "#d9e811",
                    middle: "#e0f040",
                    outer: "#f0f880",
                },
                position: { cx: 0.4, cy: 1.0 },
                size: { rx: 0.75, ry: 0.5 },
                animation: {
                    driftRadius: 25,
                    driftDuration: 35000,
                    driftDirection: -1,
                    opacityDuration: 8000,
                    opacityRange: [0.35, 0.65],
                    scaleDuration: 10000,
                    scaleRange: [0.9, 1.1],
                },
            },
        ],
    },
    fast: {
        layers: [
            {
                id: "greenBlob",
                colors: {
                    inner: "#7fff00",
                    middle: "#adff2f",
                    outer: "#d0ff80",
                },
                position: { cx: 0.5, cy: 0.85 },
                size: { rx: 1.2, ry: 0.7 },
                animation: {
                    driftRadius: 50,
                    driftDuration: 6000,
                    driftDirection: 1,
                    opacityDuration: 2000,
                    opacityRange: [0.7, 0.95],
                    scaleDuration: 2500,
                    scaleRange: [0.9, 1.1],
                },
            },
            {
                id: "tealBlob",
                colors: {
                    inner: "#00ffff",
                    middle: "#40e0d0",
                    outer: "#7fffd4",
                },
                position: { cx: 0.2, cy: 0.9 },
                size: { rx: 0.85, ry: 0.55 },
                animation: {
                    driftRadius: 60,
                    driftDuration: 5000,
                    driftDirection: -1,
                    opacityDuration: 2500,
                    opacityRange: [0.5, 0.8],
                    scaleDuration: 2000,
                    scaleRange: [0.85, 1.15],
                },
            },
            {
                id: "blueBlob",
                colors: {
                    inner: "#00bfff",
                    middle: "#87ceeb",
                    outer: "#b0e0e6",
                },
                position: { cx: 0.8, cy: 0.88 },
                size: { rx: 0.8, ry: 0.52 },
                animation: {
                    driftRadius: 55,
                    driftDuration: 4500,
                    driftDirection: 1,
                    opacityDuration: 1800,
                    opacityRange: [0.45, 0.8],
                    scaleDuration: 2200,
                    scaleRange: [0.88, 1.12],
                },
            },
            {
                id: "chartreuseAccent",
                colors: {
                    inner: "#ffff00",
                    middle: "#ffd700",
                    outer: "#ffe680",
                },
                position: { cx: 0.4, cy: 1.0 },
                size: { rx: 0.75, ry: 0.5 },
                animation: {
                    driftRadius: 45,
                    driftDuration: 5500,
                    driftDirection: -1,
                    opacityDuration: 2200,
                    opacityRange: [0.5, 0.85],
                    scaleDuration: 1800,
                    scaleRange: [0.85, 1.15],
                },
            },
        ],
    },
};

// ============================================================================
// ANIMATED GRADIENT LAYER COMPONENT
// Uses native driver for smooth 60fps animations
// ============================================================================

interface GradientLayerProps {
    config: LayerConfig;
    index: number;
}

function GradientLayer({ config, index }: GradientLayerProps): React.JSX.Element {
    // Animation values - all use native driver for smooth performance
    const driftAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(config.animation.opacityRange[0])).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Circular drift animation
        const driftAnimation = Animated.loop(
            Animated.timing(driftAnim, {
                toValue: config.animation.driftDirection,
                duration: config.animation.driftDuration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        // Opacity pulsing
        const opacityAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: config.animation.opacityRange[1],
                    duration: config.animation.opacityDuration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: config.animation.opacityRange[0],
                    duration: config.animation.opacityDuration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        // Scale pulsing for breathing effect
        const scaleAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: config.animation.scaleRange[1],
                    duration: config.animation.scaleDuration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: config.animation.scaleRange[0],
                    duration: config.animation.scaleDuration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        driftAnimation.start();
        opacityAnimation.start();
        scaleAnimation.start();

        return () => {
            driftAnimation.stop();
            opacityAnimation.stop();
            scaleAnimation.stop();
        };
    }, [config, driftAnim, opacityAnim, scaleAnim]);

    // Calculate base positions
    const cx = SCREEN_WIDTH * config.position.cx;
    const cy = SCREEN_HEIGHT * config.position.cy;
    const rx = SCREEN_WIDTH * config.size.rx;
    const ry = SCREEN_HEIGHT * config.size.ry;

    // Interpolate drift into circular motion (translate X and Y)
    const translateX = driftAnim.interpolate({
        inputRange: [-1, -0.5, 0, 0.5, 1],
        outputRange: [
            -config.animation.driftRadius,
            0,
            config.animation.driftRadius,
            0,
            -config.animation.driftRadius,
        ],
    });

    const translateY = driftAnim.interpolate({
        inputRange: [-1, -0.5, 0, 0.5, 1],
        outputRange: [
            0,
            -config.animation.driftRadius * 0.6,
            0,
            config.animation.driftRadius * 0.6,
            0,
        ],
    });

    return (
        <Animated.View
            style={[
                styles.layerContainer,
                {
                    opacity: opacityAnim,
                    transform: [
                        { translateX },
                        { translateY },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <Svg width={SCREEN_WIDTH * 1.5} height={SCREEN_HEIGHT * 1.5} style={styles.svg}>
                <Defs>
                    <RadialGradient
                        id={`${config.id}_${index}`}
                        cx="50%"
                        cy="50%"
                        rx="50%"
                        ry="50%"
                    >
                        <Stop offset="0%" stopColor={config.colors.inner} stopOpacity="1" />
                        <Stop offset="40%" stopColor={config.colors.middle} stopOpacity="0.7" />
                        <Stop offset="70%" stopColor={config.colors.outer} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Ellipse
                    cx={cx + SCREEN_WIDTH * 0.25}
                    cy={cy + SCREEN_HEIGHT * 0.25}
                    rx={rx}
                    ry={ry}
                    fill={`url(#${config.id}_${index})`}
                />
            </Svg>
        </Animated.View>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface OrganicGradientBackgroundProps {
    children?: React.ReactNode;
    mode?: GradientMode;
}

export default function OrganicGradientBackground({
    children,
    mode = "slow",
}: OrganicGradientBackgroundProps): React.JSX.Element {
    const modeConfig = GRADIENT_MODES[mode];

    return (
        <View style={styles.container}>
            {/* Base cream background */}
            <View style={styles.baseBackground} />

            {/* Animated gradient layers */}
            <View style={styles.gradientContainer}>
                {modeConfig.layers.map((layerConfig, index) => (
                    <GradientLayer
                        key={layerConfig.id}
                        config={layerConfig}
                        index={index}
                    />
                ))}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>{children}</View>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    baseBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: CREAM,
    },
    gradientContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
    },
    layerContainer: {
        position: "absolute",
        top: -SCREEN_HEIGHT * 0.25,
        left: -SCREEN_WIDTH * 0.25,
        width: SCREEN_WIDTH * 1.5,
        height: SCREEN_HEIGHT * 1.5,
    },
    svg: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    contentContainer: {
        flex: 1,
    },
});
