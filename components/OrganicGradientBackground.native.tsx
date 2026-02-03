import {
    Canvas,
    Fill,
    Shader,
    Skia,
    useClock,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useDerivedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// CONFIGURATION
// ============================================================================

export type GradientMode = "slow" | "fast";

interface ModeConfig {
    // How fast the hue rotates (radians per second)
    hueSpeed: number;
    // How fast the blobs drift
    driftSpeed: number;
    // How pronounced the movement is
    driftAmount: number;
    // Blur/softness of the gradients
    softness: number;
}

const MODE_CONFIGS: Record<GradientMode, ModeConfig> = {
    slow: {
        hueSpeed: 0.15,
        driftSpeed: 0.2,
        driftAmount: 0.01,
        softness: 0.2,
    },
    fast: {
        hueSpeed: 0.5,
        driftSpeed: 0.8,
        driftAmount: 0.12,
        softness: 0.35,
    },
};

// ============================================================================
// SKIA SHADER - Runs entirely on GPU for smooth 60fps
// ============================================================================

// This shader creates multiple soft radial gradients that:
// 1. Drift slowly in organic patterns
// 2. Shift through hues smoothly (mood ring effect)
// 3. Blend together with soft edges
const moodRingShader = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float time;

    // Configuration uniforms
    uniform float hueSpeed;
    uniform float driftSpeed;
    uniform float driftAmount;
    uniform float softness;

    // Base colors (in HSL-like space, we'll animate the hue)
    const float3 baseColor1 = float3(0.25, 0.85, 0.65); // Green-ish
    const float3 baseColor2 = float3(0.5, 0.75, 0.6);   // Cyan-ish
    const float3 baseColor3 = float3(0.55, 0.8, 0.55);  // Blue-ish
    const float3 baseColor4 = float3(0.18, 0.9, 0.7);   // Yellow-green

    // Convert HSL to RGB
    float3 hsl2rgb(float3 hsl) {
        float h = hsl.x;
        float s = hsl.y;
        float l = hsl.z;

        float c = (1.0 - abs(2.0 * l - 1.0)) * s;
        float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
        float m = l - c / 2.0;

        float3 rgb;
        if (h < 1.0/6.0) rgb = float3(c, x, 0.0);
        else if (h < 2.0/6.0) rgb = float3(x, c, 0.0);
        else if (h < 3.0/6.0) rgb = float3(0.0, c, x);
        else if (h < 4.0/6.0) rgb = float3(0.0, x, c);
        else if (h < 5.0/6.0) rgb = float3(x, 0.0, c);
        else rgb = float3(c, 0.0, x);

        return rgb + m;
    }

    // Soft radial gradient
    float softGradient(float2 uv, float2 center, float radius, float soft) {
        float dist = length(uv - center);
        return 1.0 - smoothstep(0.0, radius * (1.0 + soft), dist);
    }

    half4 main(float2 fragCoord) {
        float2 uv = fragCoord / resolution;

        // Cream background color
        float3 cream = float3(0.976, 0.961, 0.929);

        // Animate blob positions with organic drift
        float t = time * driftSpeed;

        // Each blob drifts in a unique pattern (Lissajous-like curves)
        float2 center1 = float2(
            0.5 + sin(t * 0.7) * driftAmount + cos(t * 0.3) * driftAmount * 0.5,
            0.85 + cos(t * 0.5) * driftAmount * 0.3
        );
        float2 center2 = float2(
            0.2 + sin(t * 0.5 + 1.0) * driftAmount + sin(t * 0.8) * driftAmount * 0.3,
            0.9 + cos(t * 0.6 + 2.0) * driftAmount * 0.4
        );
        float2 center3 = float2(
            0.8 + cos(t * 0.6 + 3.0) * driftAmount + sin(t * 0.4) * driftAmount * 0.4,
            0.88 + sin(t * 0.4 + 1.5) * driftAmount * 0.3
        );
        float2 center4 = float2(
            0.4 + sin(t * 0.4 + 2.0) * driftAmount * 0.8,
            1.0 + cos(t * 0.7 + 0.5) * driftAmount * 0.2
        );

        // Animate hue rotation (the "mood ring" effect)
        float hueShift = time * hueSpeed;

        // Create colors with shifting hues
        float3 color1 = hsl2rgb(float3(mod(baseColor1.x + hueShift, 1.0), baseColor1.y, baseColor1.z));
        float3 color2 = hsl2rgb(float3(mod(baseColor2.x + hueShift, 1.0), baseColor2.y, baseColor2.z));
        float3 color3 = hsl2rgb(float3(mod(baseColor3.x + hueShift, 1.0), baseColor3.y, baseColor3.z));
        float3 color4 = hsl2rgb(float3(mod(baseColor4.x + hueShift, 1.0), baseColor4.y, baseColor4.z));

        // Calculate gradient intensities
        float g1 = softGradient(uv, center1, 0.7, softness);
        float g2 = softGradient(uv, center2, 0.5, softness);
        float g3 = softGradient(uv, center3, 0.45, softness);
        float g4 = softGradient(uv, center4, 0.4, softness);

        // Blend colors additively with soft falloff
        float3 finalColor = cream;

        // Layer the gradients (back to front, blending with cream)
        finalColor = mix(finalColor, color4, g4 * 0.5);
        finalColor = mix(finalColor, color3, g3 * 0.45);
        finalColor = mix(finalColor, color2, g2 * 0.55);
        finalColor = mix(finalColor, color1, g1 * 0.6);

        return half4(finalColor, 1.0);
    }
`)!;

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
    const config = MODE_CONFIGS[mode];

    // Clock for smooth animation (updates every frame, in milliseconds)
    const clock = useClock();

    // Uniforms that change every frame - use derived value for animation
    const uniforms = useDerivedValue(() => ({
        resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
        time: clock.value / 1000, // Convert ms to seconds
        hueSpeed: config.hueSpeed,
        driftSpeed: config.driftSpeed,
        driftAmount: config.driftAmount,
        softness: config.softness,
    }), [clock, config]);

    return (
        <View style={styles.container}>
            {/* Skia Canvas for GPU-accelerated gradient */}
            <Canvas style={styles.canvas}>
                <Fill>
                    <Shader source={moodRingShader} uniforms={uniforms} />
                </Fill>
            </Canvas>

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
    canvas: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
    },
});
