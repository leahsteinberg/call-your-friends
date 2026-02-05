import {
    Canvas,
    Fill,
    Shader,
    Skia
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
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
// COLOR UTILITIES
// ============================================================================

function hexToHSL(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return [0, 0, l];

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;

    return [h, s, l];
}

// Purple, blue, pink
export const DEFAULT_GRADIENT_COLORS: [string, string, string] = ['#8B5CF6', '#3B82F6', '#EC4899'];

// Fixed 4th accent blob — light blue
const ACCENT_COLOR = '#7DD3FC';
const ACCENT_HSL = hexToHSL(ACCENT_COLOR);

// How far each blob's hue oscillates from its base (±0.08 = ±29° on color wheel)
const HUE_RANGE = 0.08;

// ============================================================================
// CONFIGURATION
// ============================================================================

export type GradientMode = "slow" | "fast";

interface ModeConfig {
    hueSpeed1: number;
    hueSpeed2: number;
    hueSpeed3: number;
    hueSpeed4: number;
    rotSpeed1: number;
    rotSpeed2: number;
    rotSpeed3: number;
    rotSpeed4: number;
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
        hueSpeed4: 0.035,
        rotSpeed1: 0.08,
        rotSpeed2: 0.05,
        rotSpeed3: 0.1,
        rotSpeed4: 0.07,
        scale: .9,
        satBoost: 0.0,
        intensity: .9,
    },
    fast: {
        hueSpeed1: 0.15,
        hueSpeed2: 0.10,
        hueSpeed3: 0.20,
        hueSpeed4: 0.18,
        rotSpeed1: 0.35,
        rotSpeed2: 0.35,
        rotSpeed3: 0.52,
        rotSpeed4: 0.35,
        scale: 1.45,
        satBoost: 0.25,
        intensity: 1.4,
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
    uniform float huePhase4;
    uniform float rotPhase1;
    uniform float rotPhase2;
    uniform float rotPhase3;
    uniform float rotPhase4;

    // Dynamic properties (smoothly animated)
    uniform float scale;     // 1.0 = normal, >1 = bigger blobs
    uniform float satBoost;  // 0.0 = normal, >0 = more vivid
    uniform float intensity; // 1.0 = normal, >1 = stronger color

    // Base colors (HSL) and oscillation range
    uniform float3 baseColor1;
    uniform float3 baseColor2;
    uniform float3 baseColor3;
    uniform float3 baseColor4;
    uniform float hueRange;

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

        // ---- Blob 1 — large, centered at bottom middle ----
        float3 col1 = hsl2rgb(float3(mod(baseColor1.x + sin(huePhase1) * hueRange, 1.0), min(baseColor1.y + satBoost, 1.0), baseColor1.z));
        float  g1   = ellipseGrad(uv, float2(0.5, .2), float2(0.9, 0.60), rotPhase1);

        // ---- Blob 2 — offset left ----
        float3 col2 = hsl2rgb(float3(mod(baseColor2.x + sin(huePhase2) * hueRange, 1.0), min(baseColor2.y + satBoost, 1.0), baseColor2.z));
        float  g2   = ellipseGrad(uv, float2(0.35, .2), float2(0.65, 0.45), rotPhase2);

        // ---- Blob 3 — offset right ----
        float3 col3 = hsl2rgb(float3(mod(baseColor3.x + sin(huePhase3) * hueRange, 1.0), min(baseColor3.y + satBoost, 1.0), baseColor3.z));
        float  g3   = ellipseGrad(uv, float2(0.65, .25), float2(0.60, 0.42), rotPhase3);

        // ---- Blob 4 — light blue accent, bottom center ----
        float3 col4 = hsl2rgb(float3(mod(baseColor4.x + sin(huePhase4) * hueRange, 1.0), min(baseColor4.y + satBoost, 1.0), baseColor4.z));
        float  g4   = ellipseGrad(uv, float2(0.45, .4), float2(0.55, 0.38), rotPhase4);

        // ---- Composite: layer blobs onto cream ----
        float3 result = cream;
        result = mix(result, col1, g1 * 0.70 * intensity);
        result = mix(result, col2, g2 * 0.50 * intensity);
        result = mix(result, col3, g3 * 0.45 * intensity);
        result = mix(result, col4, g4 * 0.40 * intensity);

        return half4(result, 1.0);
    }
`)!;

// ============================================================================
// COMPONENT
// ============================================================================

interface OrganicGradientBackgroundProps {
    children?: React.ReactNode;
    mode?: GradientMode;
    colors?: [string, string, string];
}

export default function OrganicGradientBackground({
    children,
    mode = "slow",
    colors = DEFAULT_GRADIENT_COLORS,
}: OrganicGradientBackgroundProps): React.JSX.Element {
    // Convert hex colors to HSL for the shader
    const hsl1 = useMemo(() => hexToHSL(colors[0]), [colors[0]]);
    const hsl2 = useMemo(() => hexToHSL(colors[1]), [colors[1]]);
    const hsl3 = useMemo(() => hexToHSL(colors[2]), [colors[2]]);

    // Current speeds (animated with springs when mode changes)
    const hueSpeed1 = useSharedValue(MODE_CONFIGS[mode].hueSpeed1);
    const hueSpeed2 = useSharedValue(MODE_CONFIGS[mode].hueSpeed2);
    const hueSpeed3 = useSharedValue(MODE_CONFIGS[mode].hueSpeed3);
    const hueSpeed4 = useSharedValue(MODE_CONFIGS[mode].hueSpeed4);
    const rotSpeed1 = useSharedValue(MODE_CONFIGS[mode].rotSpeed1);
    const rotSpeed2 = useSharedValue(MODE_CONFIGS[mode].rotSpeed2);
    const rotSpeed3 = useSharedValue(MODE_CONFIGS[mode].rotSpeed3);
    const rotSpeed4 = useSharedValue(MODE_CONFIGS[mode].rotSpeed4);
    const scale = useSharedValue(MODE_CONFIGS[mode].scale);
    const satBoost = useSharedValue(MODE_CONFIGS[mode].satBoost);
    const intensity = useSharedValue(MODE_CONFIGS[mode].intensity);

    // Accumulated phases — incremented each frame by (dt * speed).
    // Speed changes only affect future accumulation, no retroactive jumps.
    const huePhase1 = useSharedValue(0);
    const huePhase2 = useSharedValue(0);
    const huePhase3 = useSharedValue(0);
    const huePhase4 = useSharedValue(0);
    const rotPhase1 = useSharedValue(0);
    const rotPhase2 = useSharedValue(0);
    const rotPhase3 = useSharedValue(0);
    const rotPhase4 = useSharedValue(0);

    // Accumulate phases every frame on the UI thread
    useFrameCallback((frameInfo) => {
        "worklet";
        const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
        huePhase1.value += dt * hueSpeed1.value;
        huePhase2.value += dt * hueSpeed2.value;
        huePhase3.value += dt * hueSpeed3.value;
        huePhase4.value += dt * hueSpeed4.value;
        rotPhase1.value += dt * rotSpeed1.value;
        rotPhase2.value += dt * rotSpeed2.value;
        rotPhase3.value += dt * rotSpeed3.value;
        rotPhase4.value += dt * rotSpeed4.value;
    });

    // Smoothly animate speeds and visual properties when mode changes
    useEffect(() => {
        const target = MODE_CONFIGS[mode];
        hueSpeed1.value = withSpring(target.hueSpeed1, TRANSITION_SPRING);
        hueSpeed2.value = withSpring(target.hueSpeed2, TRANSITION_SPRING);
        hueSpeed3.value = withSpring(target.hueSpeed3, TRANSITION_SPRING);
        hueSpeed4.value = withSpring(target.hueSpeed4, TRANSITION_SPRING);
        rotSpeed1.value = withSpring(target.rotSpeed1, TRANSITION_SPRING);
        rotSpeed2.value = withSpring(target.rotSpeed2, TRANSITION_SPRING);
        rotSpeed3.value = withSpring(target.rotSpeed3, TRANSITION_SPRING);
        rotSpeed4.value = withSpring(target.rotSpeed4, TRANSITION_SPRING);
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
        huePhase4: huePhase4.value,
        rotPhase1: rotPhase1.value,
        rotPhase2: rotPhase2.value,
        rotPhase3: rotPhase3.value,
        rotPhase4: rotPhase4.value,
        scale: scale.value,
        satBoost: satBoost.value,
        intensity: intensity.value,
        baseColor1: hsl1,
        baseColor2: hsl2,
        baseColor3: hsl3,
        baseColor4: ACCENT_HSL,
        hueRange: HUE_RANGE,
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
