import {
    Canvas,
    Fill,
    Shader,
    Skia
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

// ============================================================================
// CONFIGURATION
// ============================================================================

export type GradientMode = "slow" | "fast";

interface ModeConfig {
    hueSpeed1: number;
    hueSpeed2: number;
    hueSpeed3: number;
    rotSpeed1: number;
    rotSpeed2: number;
    rotSpeed3: number;
    // Scale multiplier for blob size (1.0 = normal)
    scale: number;
    // Saturation boost (0.0 = normal, 0.3 = vivid)
    satBoost: number;
    // Opacity/intensity multiplier
    intensity: number;
}

const MODE_CONFIGS: Record<GradientMode, ModeConfig> = {
    slow: {
        hueSpeed1: 0.04,
        hueSpeed2: 0.025,
        hueSpeed3: 0.055,
        rotSpeed1: 0.08,
        rotSpeed2: 0.05,
        rotSpeed3: 0.11,
        scale: 1.0,
        satBoost: 0.0,
        intensity: 1.0,
    },
    fast: {
        hueSpeed1: 0.15,
        hueSpeed2: 0.10,
        hueSpeed3: 0.20,
        rotSpeed1: 0.3,
        rotSpeed2: 0.2,
        rotSpeed3: 0.4,
        scale: 1.35,
        satBoost: 0.2,
        intensity: 1.3,
    },
};

// Spring config for smooth organic transitions
const TRANSITION_SPRING = {
    damping: 20,
    stiffness: 40,
    mass: 1,
};

// ============================================================================
// SKIA SHADER
// Three large elliptical gradients centered at bottom of screen.
// Each rotates independently and shifts color at its own rate.
// ============================================================================

const organicShader = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float aspect;

    // Accumulated phases (incremented each frame, not time * speed)
    uniform float huePhase1;
    uniform float huePhase2;
    uniform float huePhase3;
    uniform float rotPhase1;
    uniform float rotPhase2;
    uniform float rotPhase3;

    // Dynamic properties (smoothly animated)
    uniform float scale;     // 1.0 = normal, >1 = bigger blobs
    uniform float satBoost;  // 0.0 = normal, >0 = more vivid
    uniform float intensity; // 1.0 = normal, >1 = stronger color

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
    float ellipseGrad(float2 uv, float2 center, float2 radii, float angle) {
        float2 p = uv - center;
        p.x *= aspect;
        float2 r = radii * scale;
        r.x *= aspect;
        float ca = cos(angle);
        float sa = sin(angle);
        p = float2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
        float2 q = p / r;
        float d = length(q);
        float i = 1.0 - smoothstep(0.0, 1.0, d);
        return i * i;
    }

    half4 main(float2 fragCoord) {
        float2 uv = fragCoord / resolution;

        float3 cream = float3(0.976, 0.961, 0.929);

        // ---- Blob 1: Green — large, centered at bottom middle ----
        float3 col1 = hsl2rgb(float3(mod(0.25 + huePhase1, 1.0), min(0.75 + satBoost, 1.0), 0.58));
        float  g1   = ellipseGrad(uv, float2(0.5, .45), float2(0.9, 0.60), rotPhase1);

        // ---- Blob 2: Teal — offset left ----
        float3 col2 = hsl2rgb(float3(mod(0.48 + huePhase2, 1.0), min(0.60 + satBoost, 1.0), 0.55));
        float  g2   = ellipseGrad(uv, float2(0.35, .45), float2(0.65, 0.45), rotPhase2);

        // ---- Blob 3: Blue — offset right ----
        float3 col3 = hsl2rgb(float3(mod(0.56 + huePhase3, 1.0), min(0.70 + satBoost, 1.0), 0.52));
        float  g3   = ellipseGrad(uv, float2(0.65, .45), float2(0.60, 0.42), rotPhase3);

        // ---- Composite: layer blobs onto cream ----
        float3 result = cream;
        result = mix(result, col1, g1 * 0.70 * intensity);
        result = mix(result, col2, g2 * 0.50 * intensity);
        result = mix(result, col3, g3 * 0.45 * intensity);

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
    // Current speeds (animated with springs when mode changes)
    const hueSpeed1 = useSharedValue(MODE_CONFIGS[mode].hueSpeed1);
    const hueSpeed2 = useSharedValue(MODE_CONFIGS[mode].hueSpeed2);
    const hueSpeed3 = useSharedValue(MODE_CONFIGS[mode].hueSpeed3);
    const rotSpeed1 = useSharedValue(MODE_CONFIGS[mode].rotSpeed1);
    const rotSpeed2 = useSharedValue(MODE_CONFIGS[mode].rotSpeed2);
    const rotSpeed3 = useSharedValue(MODE_CONFIGS[mode].rotSpeed3);
    const scale = useSharedValue(MODE_CONFIGS[mode].scale);
    const satBoost = useSharedValue(MODE_CONFIGS[mode].satBoost);
    const intensity = useSharedValue(MODE_CONFIGS[mode].intensity);

    // Accumulated phases — incremented each frame by (dt * speed).
    // Speed changes only affect future accumulation, no retroactive jumps.
    const huePhase1 = useSharedValue(0);
    const huePhase2 = useSharedValue(0);
    const huePhase3 = useSharedValue(0);
    const rotPhase1 = useSharedValue(0);
    const rotPhase2 = useSharedValue(0);
    const rotPhase3 = useSharedValue(0);

    // Accumulate phases every frame on the UI thread
    useFrameCallback((frameInfo) => {
        "worklet";
        const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
        huePhase1.value += dt * hueSpeed1.value;
        huePhase2.value += dt * hueSpeed2.value;
        huePhase3.value += dt * hueSpeed3.value;
        rotPhase1.value += dt * rotSpeed1.value;
        rotPhase2.value += dt * rotSpeed2.value;
        rotPhase3.value += dt * rotSpeed3.value;
    });

    // Smoothly animate speeds and visual properties when mode changes
    useEffect(() => {
        const target = MODE_CONFIGS[mode];
        hueSpeed1.value = withSpring(target.hueSpeed1, TRANSITION_SPRING);
        hueSpeed2.value = withSpring(target.hueSpeed2, TRANSITION_SPRING);
        hueSpeed3.value = withSpring(target.hueSpeed3, TRANSITION_SPRING);
        rotSpeed1.value = withSpring(target.rotSpeed1, TRANSITION_SPRING);
        rotSpeed2.value = withSpring(target.rotSpeed2, TRANSITION_SPRING);
        rotSpeed3.value = withSpring(target.rotSpeed3, TRANSITION_SPRING);
        scale.value = withSpring(target.scale, TRANSITION_SPRING);
        satBoost.value = withSpring(target.satBoost, TRANSITION_SPRING);
        intensity.value = withSpring(target.intensity, TRANSITION_SPRING);
    }, [mode]);

    const uniforms = useDerivedValue(() => ({
        resolution: [SCREEN_WIDTH, SCREEN_HEIGHT],
        aspect: ASPECT,
        huePhase1: huePhase1.value,
        huePhase2: huePhase2.value,
        huePhase3: huePhase3.value,
        rotPhase1: rotPhase1.value,
        rotPhase2: rotPhase2.value,
        rotPhase3: rotPhase3.value,
        scale: scale.value,
        satBoost: satBoost.value,
        intensity: intensity.value,
    }));

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
