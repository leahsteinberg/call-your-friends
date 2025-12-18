import FlowerBlob from '@/assets/images/flower-blob.svg';
import { ORANGE } from '@/styles/styles';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';



interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
}
const WIDTH = 200;
const HEIGHT = 50;
const CIRCLE_DIAM = 36;


export default function ToggleSwitch({
    value,
    onValueChange,
    disabled = false,
    activeColor = '#4CD964',
    inactiveColor = '#E0E0E0',
    thumbColor = '#FFFFFF',
}: ToggleSwitchProps) {
    const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Bouncy slide animation
        Animated.spring(translateX, {
            toValue: value ? 1 : 0,
            useNativeDriver: true,
            friction: 5,
            tension: 100,
        }).start(() => {
            // Trigger icon animation when slide completes
            if (value) {
                animateIcon();
            }
        });
    }, [value]);

    const animateIcon = () => {
        // Scale up and rotate
        Animated.sequence([
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 1.3,
                    duration: 200,
                    easing: Easing.out(Easing.back(2)),
                    useNativeDriver: true,
                }),
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(rotation, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handlePress = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    const thumbTranslateX = translateX.interpolate({
        inputRange: [0, 1],
        outputRange: [2, WIDTH-38],
        extrapolate: 'clamp',
    });

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '15deg'],
        extrapolate: 'clamp',
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            disabled={disabled}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.track,
                    {
                        backgroundColor: value ? activeColor : inactiveColor,
                        opacity: disabled ? 0.5 : 1,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: thumbColor,
                            transform: [
                                { translateX: thumbTranslateX },
                                { scale },
                                { rotate },
                            ],
                        },
                    ]}
                >  
                <FlowerBlob
                    fill={ORANGE}
                />
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    track: {
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 30,
        justifyContent: 'center',
    },
    thumb: {
        width: CIRCLE_DIAM,
        height: CIRCLE_DIAM,
        borderRadius: 99,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
