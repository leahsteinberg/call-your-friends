import Butterfly from "@/assets/images/butterfly.svg";
import { CORNFLOWER_BLUE, PALE_BLUE } from "@/styles/styles";
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ButterflyTimerProps {
    createdAt: string; // ISO timestamp
    durationMinutes?: number; // Default 60 minutes
    size?: number; // Default 80
}

export default function ButterflyTimer({
    createdAt,
    durationMinutes = 60,
    size = 80
}: ButterflyTimerProps): React.JSX.Element {
    const progress = useSharedValue(0);
    const wingFlutter = useSharedValue(1);

    const radius = size * 0.35;
    const center = size / 2;
    const butterflySize = size * 0.2;

    useEffect(() => {
        // Calculate elapsed time and progress
        const updateProgress = () => {
            const now = new Date().getTime();
            const created = new Date(createdAt).getTime();
            const elapsed = now - created;
            const duration = durationMinutes * 60 * 1000; // Convert to ms
            console.log(duration)
            const newProgress = Math.min(3000000 / duration, 1);

            progress.value = withTiming(newProgress, {
                duration: 1000,
                easing: Easing.out(Easing.ease)
            });
        };

        // Update immediately
        updateProgress();

        // Update every second
        const interval = setInterval(updateProgress, 1000);

        return () => clearInterval(interval);
    }, [createdAt, durationMinutes]);

    // Wing flutter animation for alive feeling
    useEffect(() => {
        wingFlutter.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    // Butterfly position along arc
    const butterflyStyle = useAnimatedStyle(() => {
        // Progress goes from 0 (start) to 1 (end)
        // Map to arc from π (left) to 0 (right) - traveling clockwise
        const angle = interpolate(
            progress.value,
            [0, 1],
            [Math.PI, 0]
        );

        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

        return {
            position: 'absolute',
            left: x - butterflySize / 2,
            top: y - butterflySize / 2,
            width: butterflySize,
            height: butterflySize,
            transform: [
                { rotate: `${-angle + Math.PI / 2}rad` }, // Face direction of travel
                { scale: wingFlutter.value }
            ]
        };
    });

    // Animated trail that fades
    const trailProps = useAnimatedProps(() => {
        const endAngle = interpolate(progress.value, [0, 1], [Math.PI, 0]);

        // SVG arc path
        const startX = center + Math.cos(Math.PI) * radius;
        const startY = center + Math.sin(Math.PI) * radius;
        const endX = center + Math.cos(endAngle) * radius;
        const endY = center + Math.sin(endAngle) * radius;

        const largeArcFlag = endAngle < 0 ? 1 : 0;

        return {
            d: `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`,
            strokeDasharray: `${progress.value * Math.PI * radius}, ${Math.PI * radius}`
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background arc (unfilled path) */}
                <Path
                    d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 0 ${center + radius} ${center}`}
                    stroke={PALE_BLUE}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4, 4"
                    opacity={0.3}
                />

                {/* Filled trail */}
                <AnimatedPath
                    animatedProps={trailProps}
                    stroke={CORNFLOWER_BLUE}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Start dot */}
                <Circle
                    cx={center - radius}
                    cy={center}
                    r="3"
                    fill={PALE_BLUE}
                />

                {/* End dot */}
                <Circle
                    cx={center + radius}
                    cy={center}
                    r="3"
                    fill={CORNFLOWER_BLUE}
                />
            </Svg>

            {/* Butterfly */}
            <Animated.View style={butterflyStyle}>
                <Butterfly width={butterflySize} height={butterflySize} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    }
});
