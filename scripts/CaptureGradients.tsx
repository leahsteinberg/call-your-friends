/**
 * Dev-only utility: Temporarily render this component to capture static
 * gradient background images for both "slow" and "fast" modes.
 *
 * Usage:
 *   1. Import and render <CaptureGradients /> somewhere (e.g. in index.tsx)
 *   2. Run the app on a device/simulator
 *   3. Wait for the "Saved!" alerts
 *   4. Find the images in the app's document directory
 *      - iOS Simulator: check the path logged to the console
 *      - Physical device: use Xcode > Devices > Download Container
 *   5. Copy them to assets/images/ and remove this component
 */
import {
    Canvas,
    Fill,
    Shader,
    Skia,
    useCanvasRef,
} from "@shopify/react-native-skia";
import { Directory, File, Paths } from "expo-file-system/next";
import React, { useCallback, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

// ---- Same color utilities as OrganicGradientBackground ----
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

const COLORS: [string, string, string] = ['#8B5CF6', '#3B82F6', '#EC4899'];
const ACCENT_HSL = hexToHSL('#7DD3FC');
const HUE_RANGE = 0.08;

const hsl1 = hexToHSL(COLORS[0]);
const hsl2 = hexToHSL(COLORS[1]);
const hsl3 = hexToHSL(COLORS[2]);

// ---- Same shader as OrganicGradientBackground ----
const organicShader = Skia.RuntimeEffect.Make(`
    uniform float2 resolution;
    uniform float aspect;
    uniform float huePhase1;
    uniform float huePhase2;
    uniform float huePhase3;
    uniform float huePhase4;
    uniform float rotPhase1;
    uniform float rotPhase2;
    uniform float rotPhase3;
    uniform float rotPhase4;
    uniform float scale;
    uniform float satBoost;
    uniform float intensity;
    uniform float3 baseColor1;
    uniform float3 baseColor2;
    uniform float3 baseColor3;
    uniform float3 baseColor4;
    uniform float hueRange;

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
        float3 col1 = hsl2rgb(float3(mod(baseColor1.x + sin(huePhase1) * hueRange, 1.0), min(baseColor1.y + satBoost, 1.0), baseColor1.z));
        float  g1   = ellipseGrad(uv, float2(0.5, .2), float2(0.9, 0.60), rotPhase1);
        float3 col2 = hsl2rgb(float3(mod(baseColor2.x + sin(huePhase2) * hueRange, 1.0), min(baseColor2.y + satBoost, 1.0), baseColor2.z));
        float  g2   = ellipseGrad(uv, float2(0.35, .2), float2(0.65, 0.45), rotPhase2);
        float3 col3 = hsl2rgb(float3(mod(baseColor3.x + sin(huePhase3) * hueRange, 1.0), min(baseColor3.y + satBoost, 1.0), baseColor3.z));
        float  g3   = ellipseGrad(uv, float2(0.65, .25), float2(0.60, 0.42), rotPhase3);
        float3 col4 = hsl2rgb(float3(mod(baseColor4.x + sin(huePhase4) * hueRange, 1.0), min(baseColor4.y + satBoost, 1.0), baseColor4.z));
        float  g4   = ellipseGrad(uv, float2(0.45, .4), float2(0.55, 0.38), rotPhase4);
        float3 result = cream;
        result = mix(result, col1, g1 * 0.70 * intensity);
        result = mix(result, col2, g2 * 0.50 * intensity);
        result = mix(result, col3, g3 * 0.45 * intensity);
        result = mix(result, col4, g4 * 0.40 * intensity);
        return half4(result, 1.0);
    }
`)!;

// Fixed phase values that produce nice-looking gradients
const CAPTURES = [
    {
        name: "gradient-slow-1",
        uniforms: {
            scale: 0.9, satBoost: 0.0, intensity: 0.9,
            huePhase1: 0.5, huePhase2: 1.2, huePhase3: 0.8, huePhase4: 1.6,
            rotPhase1: 0.3, rotPhase2: 0.7, rotPhase3: 1.1, rotPhase4: 0.5,
        },
    },
    {
        name: "gradient-slow-2",
        uniforms: {
            scale: 0.9, satBoost: 0.0, intensity: 0.9,
            huePhase1: 2.1, huePhase2: 0.4, huePhase3: 1.8, huePhase4: 3.0,
            rotPhase1: 1.5, rotPhase2: 2.2, rotPhase3: 0.6, rotPhase4: 1.8,
        },
    },
    {
        name: "gradient-fast-1",
        uniforms: {
            scale: 1.45, satBoost: 0.25, intensity: 1.4,
            huePhase1: 0.8, huePhase2: 1.5, huePhase3: 2.3, huePhase4: 0.6,
            rotPhase1: 1.0, rotPhase2: 1.8, rotPhase3: 0.4, rotPhase4: 2.5,
        },
    },
    {
        name: "gradient-fast-2",
        uniforms: {
            scale: 1.45, satBoost: 0.25, intensity: 1.4,
            huePhase1: 3.2, huePhase2: 1.0, huePhase3: 0.3, huePhase4: 2.1,
            rotPhase1: 2.0, rotPhase2: 0.9, rotPhase3: 2.7, rotPhase4: 1.3,
        },
    },
];

export default function CaptureGradients(): React.JSX.Element {
    const canvasRefs = useRef(CAPTURES.map(() => React.createRef<any>()));
    const [status, setStatus] = useState("Ready to capture");

    // Use useCanvasRef for each canvas
    const ref0 = useCanvasRef();
    const ref1 = useCanvasRef();
    const ref2 = useCanvasRef();
    const ref3 = useCanvasRef();
    const refs = [ref0, ref1, ref2, ref3];

    const captureAll = useCallback(async () => {
        setStatus("Capturing...");
        const dir = new Directory(Paths.document, "gradient-captures");
        if (!dir.exists) {
            dir.create();
        }

        for (let i = 0; i < CAPTURES.length; i++) {
            const capture = CAPTURES[i];
            const ref = refs[i];
            try {
                const image = await ref.current?.makeImageSnapshotAsync();
                if (image) {
                    const base64 = image.encodeToBase64();
                    const file = new File(dir.uri + capture.name + ".png");
                    file.write(base64);
                    console.log(`Saved: ${file.uri}`);
                }
            } catch (e) {
                console.error(`Failed to capture ${capture.name}:`, e);
            }
        }

        setStatus(`Saved to: ${dir.uri}`);
        Alert.alert("Capture Complete", `4 images saved to:\n${dir.uri}`);
    }, [refs]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gradient Capture Utility</Text>
            <Text style={styles.status}>{status}</Text>

            {/* Render each gradient variation */}
            <View style={styles.canvasGrid}>
                {CAPTURES.map((capture, i) => {
                    const u = {
                        resolution: [SCREEN_WIDTH, SCREEN_HEIGHT] as [number, number],
                        aspect: ASPECT,
                        ...capture.uniforms,
                        baseColor1: hsl1,
                        baseColor2: hsl2,
                        baseColor3: hsl3,
                        baseColor4: ACCENT_HSL,
                        hueRange: HUE_RANGE,
                    };
                    return (
                        <View key={capture.name} style={styles.canvasWrapper}>
                            <Canvas style={styles.canvas} ref={refs[i]}>
                                <Fill>
                                    <Shader source={organicShader} uniforms={u} />
                                </Fill>
                            </Canvas>
                            <Text style={styles.label}>{capture.name}</Text>
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity style={styles.button} onPress={captureAll}>
                <Text style={styles.buttonText}>Capture All</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
        paddingTop: 60,
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    status: {
        color: "#aaa",
        fontSize: 12,
        marginBottom: 16,
        paddingHorizontal: 20,
        textAlign: "center",
    },
    canvasGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 16,
    },
    canvasWrapper: {
        width: SCREEN_WIDTH * 0.45,
        height: SCREEN_HEIGHT * 0.3,
        borderRadius: 12,
        overflow: "hidden",
    },
    canvas: {
        width: "100%",
        height: "100%",
    },
    label: {
        position: "absolute",
        bottom: 4,
        left: 4,
        color: "white",
        fontSize: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    button: {
        marginTop: 20,
        backgroundColor: "#3B82F6",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
