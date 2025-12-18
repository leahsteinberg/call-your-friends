import { CHARTREUSE, CREAM } from '@/styles/styles';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Reanimated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';



interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
}
const WIDTH = 100;
const HEIGHT = 10;
const THUMB_DIAM = 40;
const ROTATION_START = 20;
const ROTATION_END = 50;

export default function ToggleSwitch({
    value,
    onValueChange,
    disabled = false,
    activeColor = CHARTREUSE,
    inactiveColor = CREAM,
    children,
}: ToggleSwitchProps) {
    console.log("VALUE in toggle swtich ---", value);
    console.log("Disabled -", disabled);

    const isFirstRender = useRef(true);
    const translateX = useSharedValue(value ? 1 : 0);
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const colorProgress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        // Skip animation on initial render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        colorProgress.value = withTiming(value ? 1 : 0, {
            duration: 500,
            easing: Easing.in(Easing.ease),
        });
        // Bouncy slide animation
        translateX.value = withTiming(
            value ? 1 : 0,
            {
                duration: 300,
                easing: Easing.out(Easing.ease),
            },
            (finished) => {
                // Trigger icon animation when slide completes
                if (finished && value) {
                    animateIcon();
                }
            }
        );
    }, [value]);

    const animateIcon = () => {
        'worklet';
        // Rotate back and forth
        rotation.value = withSequence(
            withTiming(1, {
                duration: 400,
                easing: Easing.inOut(Easing.back(1)),
            }),
            withTiming(0, {
                duration: 200,
            })
        );
        scale.value = withSequence(
            withTiming(.8, {
                duration: 400,
                easing: Easing.inOut(Easing.back(1)),

            }),
            withTiming(1, {
                duration: 200,
            })
        );
    };

    const handlePress = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    const colorAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            [inactiveColor, activeColor]
        );

        return {
            backgroundColor,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const thumbTranslateX = interpolate(
            translateX.value,
            [0, 1],
            [-THUMB_DIAM+16, WIDTH - THUMB_DIAM],
        );

        const rotate = interpolate(
            rotation.value,
            [0, 1],
            [ROTATION_START, ROTATION_END]
        );

        return {
            transform: [
                { translateX: thumbTranslateX },
                { scale: scale.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            disabled={disabled}
            style={styles.container}
        >
            <Reanimated.View
                style={[
                    styles.track,
                    {
                        opacity: disabled ? 0.5 : 1,
                    },
                    colorAnimatedStyle,
                ]}
            >
                <Reanimated.View style={[styles.thumb, thumbAnimatedStyle]}>
                    {children}
                </Reanimated.View>
            </Reanimated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingTop: 20,
    },
    track: {
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 30,
        justifyContent: 'center',
    },
    thumb: {
        width: THUMB_DIAM+30,
        height: THUMB_DIAM+30,
        // backgroundColor: CREAM,
        borderRadius: 99,
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.2,
        // shadowRadius: 3,
        //elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
