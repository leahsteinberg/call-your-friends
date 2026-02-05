import { CREAM } from "@/styles/styles";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// CONFIGURATION (exported for type compatibility)
// ============================================================================

export type GradientMode = "slow" | "fast";

// Purple, blue, pink
export const DEFAULT_GRADIENT_COLORS: [string, string, string] = ['#8B5CF6', '#3B82F6', '#EC4899'];

// Fixed 4th accent blob
const ACCENT_COLOR = '#7DD3FC';

// ============================================================================
// WEB FALLBACK - Static SVG gradient (Skia not available on web)
// ============================================================================

interface OrganicGradientBackgroundProps {
    children?: React.ReactNode;
    mode?: GradientMode;
    colors?: [string, string, string];
}

export default function OrganicGradientBackground({
    children,
    colors = DEFAULT_GRADIENT_COLORS,
}: OrganicGradientBackgroundProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.gradientContainer}>
                <Svg
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    style={StyleSheet.absoluteFill}
                >
                    <Defs>
                        <RadialGradient id="blob1" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.85" />
                            <Stop offset="40%" stopColor={colors[0]} stopOpacity="0.5" />
                            <Stop offset="75%" stopColor={colors[0]} stopOpacity="0.2" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        <RadialGradient id="blob2" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={colors[1]} stopOpacity="0.7" />
                            <Stop offset="35%" stopColor={colors[1]} stopOpacity="0.45" />
                            <Stop offset="70%" stopColor={colors[1]} stopOpacity="0.15" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        <RadialGradient id="blob3" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={colors[2]} stopOpacity="0.6" />
                            <Stop offset="40%" stopColor={colors[2]} stopOpacity="0.35" />
                            <Stop offset="75%" stopColor={colors[2]} stopOpacity="0.12" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        <RadialGradient id="blob4" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.65" />
                            <Stop offset="40%" stopColor={ACCENT_COLOR} stopOpacity="0.35" />
                            <Stop offset="75%" stopColor={ACCENT_COLOR} stopOpacity="0.12" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Background cream */}
                    <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill={CREAM} />

                    {/* Blob 1 — large, centered */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.4}
                        cy={SCREEN_HEIGHT * 0.4}
                        rx={SCREEN_WIDTH * 0.9}
                        ry={SCREEN_HEIGHT * 0.55}
                        fill="url(#blob1)"
                    />

                    {/* Blob 2 — offset left */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.25}
                        cy={SCREEN_HEIGHT * 0.88}
                        rx={SCREEN_WIDTH * 0.6}
                        ry={SCREEN_HEIGHT * 0.4}
                        fill="url(#blob2)"
                    />

                    {/* Blob 3 — offset right */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.75}
                        cy={SCREEN_HEIGHT * 0.85}
                        rx={SCREEN_WIDTH * 0.55}
                        ry={SCREEN_HEIGHT * 0.38}
                        fill="url(#blob3)"
                    />

                    {/* Blob 4 — light blue accent, bottom center */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.45}
                        cy={SCREEN_HEIGHT * 1.0}
                        rx={SCREEN_WIDTH * 0.5}
                        ry={SCREEN_HEIGHT * 0.35}
                        fill="url(#blob4)"
                    />
                </Svg>
            </View>
            <View style={styles.contentContainer}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
    },
    gradientContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
    },
});
