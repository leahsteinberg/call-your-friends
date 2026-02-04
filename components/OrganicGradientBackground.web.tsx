import { CREAM } from "@/styles/styles";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OrganicGradientBackgroundProps {
    children?: React.ReactNode;
}

export default function OrganicGradientBackground({ children }: OrganicGradientBackgroundProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.gradientContainer}>
                <Svg
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    style={StyleSheet.absoluteFill}
                >
                    <Defs>
                        {/* Main green blob - bottom center */}
                        <RadialGradient
                            id="greenBlob"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                        >
                            <Stop offset="0%" stopColor="#a8d94a" stopOpacity="0.85" />
                            <Stop offset="40%" stopColor="#b8e35a" stopOpacity="0.6" />
                            <Stop offset="70%" stopColor="#d0f080" stopOpacity="0.3" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        {/* Blue-teal blob - left side */}
                        <RadialGradient
                            id="tealBlob"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                        >
                            <Stop offset="0%" stopColor="#5da7e6" stopOpacity="0.7" />
                            <Stop offset="35%" stopColor="#7dc4c0" stopOpacity="0.5" />
                            <Stop offset="70%" stopColor="#a0ddd0" stopOpacity="0.25" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        {/* Soft blue blob - right side */}
                        <RadialGradient
                            id="blueBlob"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                        >
                            <Stop offset="0%" stopColor="#60a2ee" stopOpacity="0.6" />
                            <Stop offset="40%" stopColor="#80c0f0" stopOpacity="0.4" />
                            <Stop offset="75%" stopColor="#b0e0f8" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>

                        {/* Chartreuse accent */}
                        <RadialGradient
                            id="chartreuseAccent"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                        >
                            <Stop offset="0%" stopColor="#d9e811" stopOpacity="0.65" />
                            <Stop offset="50%" stopColor="#e0f040" stopOpacity="0.35" />
                            <Stop offset="100%" stopColor={CREAM} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Background cream */}
                    <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill={CREAM} />

                    {/* DEBUG: Solid ellipse to test if SVG is rendering */}
                    {/* <Ellipse cx={SCREEN_WIDTH * 0.5} cy={SCREEN_HEIGHT * 0.8} rx={200} ry={200} fill="#a8d94a" /> */}

                    {/* Main green blob - large, centered at bottom */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.4}
                        cy={SCREEN_HEIGHT * 0.4}
                        rx={SCREEN_WIDTH * 0.9}
                        ry={SCREEN_HEIGHT * 0.55}
                        fill="url(#greenBlob)"
                    />

                    {/* Teal blob - offset left */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.25}
                        cy={SCREEN_HEIGHT * 0.88}
                        rx={SCREEN_WIDTH * 0.6}
                        ry={SCREEN_HEIGHT * 0.4}
                        fill="url(#tealBlob)"
                    />

                    {/* Blue blob - offset right */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.75}
                        cy={SCREEN_HEIGHT * 0.85}
                        rx={SCREEN_WIDTH * 0.55}
                        ry={SCREEN_HEIGHT * 0.38}
                        fill="url(#blueBlob)"
                    />

                    {/* Chartreuse accent - bottom center, smaller */}
                    <Ellipse
                        cx={SCREEN_WIDTH * 0.45}
                        cy={SCREEN_HEIGHT * 1.0}
                        rx={SCREEN_WIDTH * 0.5}
                        ry={SCREEN_HEIGHT * 0.35}
                        fill="url(#chartreuseAccent)"
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