import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
}

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
        outputRange: [2, 32],
    });

    const backgroundColor = translateX.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '15deg'],
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
                        backgroundColor,
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
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8Z"
                            fill="#FFD700"
                        />
                        <Path
                            d="M12 15C8.68629 15 6 17.6863 6 21H18C18 17.6863 15.3137 15 12 15Z"
                            fill="#FFD700"
                        />
                        <Path
                            d="M3 8L6 11"
                            stroke="#FFD700"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <Path
                            d="M21 8L18 11"
                            stroke="#FFD700"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <Path
                            d="M12 3V1"
                            stroke="#FFD700"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </Svg>
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
        width: 60,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
    },
    thumb: {
        width: 28,
        height: 28,
        borderRadius: 14,
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
