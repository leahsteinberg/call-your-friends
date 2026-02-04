import { CREAM } from "@/styles/styles";
import React from "react";
import { StyleSheet, View } from "react-native";

// ============================================================================
// CONFIGURATION (exported for type compatibility)
// ============================================================================

export type GradientMode = "slow" | "fast";

// ============================================================================
// WEB FALLBACK - Simple cream background (Skia not available on web)
// ============================================================================

interface OrganicGradientBackgroundProps {
    children?: React.ReactNode;
    mode?: GradientMode;
}

export default function OrganicGradientBackground({
    children,
}: OrganicGradientBackgroundProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.background} />
            <View style={styles.contentContainer}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: CREAM,
    },
    contentContainer: {
        flex: 1,
    },
});
