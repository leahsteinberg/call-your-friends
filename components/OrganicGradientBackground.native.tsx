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
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

// ============================================================================
// CONFIGURATION
// ============================================================================

export type GradientMode = "slow" | "fast";

interface ModeConfig {
    // How fast each blob's hue shifts (radians per second)
    hueSpeed1: number;
    hueSpeed2: number;
    hueSpeed3: number;
    // How fast each blob rotates (radians per second)
    rotSpeed1: number;
    rotSpeed2: number;
    rotSpeed3: number;
}

const MODE_CONFIGS: Record<GradientMode, ModeConfig> = {
    slow: {
        hueSpeed1: 0.04,
        hueSpeed2: 0.025,
        hueSpeed3: 0.055,
        rotSpeed1: 0.08,
        rotSpeed2: 0.05,
        rotSpeed3: 0.11,
    },
    fast: {
        hueSpeed1: 0.15,
        hueSpeed2: 0.10,
        hueSpeed3: 0.20,
        rotSpeed1: 0.3,
        rotSpeed2: 0.2,
        rotSpeed3: 0.4,
    },
};

// ============================================================================
// SKIA SHADER
// Three large elliptical gradients centered at bottom of screen.
// Each rotates independently and shifts color at its own rate.
// ============================================================================

const organicShader = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float time;
    uniform float aspect;

    // Per-blob hue and rotation speeds
    uniform float hueSpeed1;
    uniform float hueSpeed2;
    uniform float hueSpeed3;
    uniform float rotSpeed1;
    uniform float rotSpeed2;
    uniform float rotSpeed3;

    // ---- HSL to RGB ----
    float3 hsl2rgb(float3 hsl) {
        float h = hsl.x;
        float s = hsl.y;
        float l = hsl.z;
        float c = (1.0 - abs(2.0 * l - 1.0)) * s;
        float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
        float m = l - c / 2.0;
        float3 rgb;
        if      (h < 1.0/6.0) rgb = float3(c, x, 0.0);
        else if (h < 2.0/6.0) rgb = float3(x, c, 0.0);
        else if (h < 3.0/6.0) rgb = float3(0.0, c, x);
        else if (h < 4.0/6.0) rgb = float3(0.0, x, c);
        else if (h < 5.0/6.0) rgb = float3(x, 0.0, c);
        else                   rgb = float3(c, 0.0, x);
        return rgb + m;
    }

    // ---- Rotated elliptical gradient ----
    // center: in UV space, radii: (rx, ry) in UV space, angle: rotation
    // Returns 0..1 intensity with multi-stop falloff matching the SVG stops.
    float ellipseGrad(float2 uv, float2 center, float2 radii, float angle) {
        float2 p = uv - center;
        // Correct for screen aspect ratio so ellipses look right
        p.x *= aspect;
        radii.x *= aspect;
        // Rotate
        float ca = cos(angle);
        float sa = sin(angle);
        p = float2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
        // Normalised distance inside ellipse
        float2 q = p / radii;
        float d = length(q);
        // Multi-stop falloff: solid core -> soft edge -> gone
        // 0..0.3 = full, 0.3..0.7 = fade, 0.7..1.0 = tail
        float intensity = 1.0 - smoothstep(0.0, 1.0, d);
        return intensity * intensity; // Square for softer falloff
    }

    half4 main(float2 fragCoord) {
        float2 uv = fragCoord / resolution;

        // Cream background  (matches CREAM constant)
        float3 cream = float3(0.976, 0.961, 0.929);

        // ---- Rotation angles ----
        float rot1 = time * rotSpeed1;
        float rot2 = time * rotSpeed2;
        float rot3 = time * rotSpeed3;

        // ---- Hue shifts (each at different rate) ----
        float hShift1 = time * hueSpeed1;
        float hShift2 = time * hueSpeed2;
        float hShift3 = time * hueSpeed3;

        // ---- Blob 1: Green  — large, centered at bottom middle ----
        // Original SVG: cx=0.5  cy=0.85  rx=0.9w  ry=0.55h
        float3 col1 = hsl2rgb(float3(mod(0.25 + hShift1, 1.0), 0.75, 0.58));
        float  g1   = ellipseGrad(uv, float2(0.5, 1.0), float2(0.9, 0.60), rot1);

        // ---- Blob 2: Teal  — offset left ----
        // Original SVG: cx=0.25 cy=0.88  rx=0.6w  ry=0.4h
        float3 col2 = hsl2rgb(float3(mod(0.48 + hShift2, 1.0), 0.60, 0.55));
        float  g2   = ellipseGrad(uv, float2(0.35, 1.0), float2(0.65, 0.45), rot2);

        // ---- Blob 3: Blue  — offset right ----
        // Original SVG: cx=0.75 cy=0.85  rx=0.55w ry=0.38h
        float3 col3 = hsl2rgb(float3(mod(0.56 + hShift3, 1.0), 0.70, 0.52));
        float  g3   = ellipseGrad(uv, float2(0.65, 1.0), float2(0.60, 0.42), rot3);

        // ---- Composite: layer blobs onto cream ----
        float3 result = cream;
        result = mix(result, col1, g1 * 0.70);
        result = mix(result, col2, g2 * 0.50);
        result = mix(result, col3, g3 * 0.45);

        return half4(result, 1.0);
    }
`)!;

// ============================================================================
// COMPONENT
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
    const clock = useClock();

    const uniforms = useDerivedValue(() => ({
        resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
        time: clock.value / 1000,
        aspect: ASPECT,
        hueSpeed1: config.hueSpeed1,
        hueSpeed2: config.hueSpeed2,
        hueSpeed3: config.hueSpeed3,
        rotSpeed1: config.rotSpeed1,
        rotSpeed2: config.rotSpeed2,
        rotSpeed3: config.rotSpeed3,
    }), [clock, config]);

    return (
        <View style={styles.container}>
            <Canvas style={styles.canvas}>
                <Fill>
                    <Shader source={organicShader} uniforms={uniforms} />
                </Fill>
            </Canvas>
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
