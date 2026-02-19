import React, { useEffect } from 'react';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useAvatarContext } from './Avatar';

interface GreyscaleProps {
    intensity?: number | SharedValue<number>;
}

export function Greyscale({ intensity = 1 }: GreyscaleProps): React.JSX.Element {
    const { size } = useAvatarContext();
    const isShared = typeof intensity !== 'number';
    const fallback = useSharedValue(isShared ? 0 : intensity);

    useEffect(() => {
        if (!isShared) {
            fallback.value = intensity as number;
        }
    }, [intensity]);

    const animatedStyle = useAnimatedStyle(() => {
        const val = isShared ? (intensity as SharedValue<number>).value : fallback.value;
        return { opacity: val * 0.5 };
    });

    return (
        <Animated.View
            style={[{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'grey',
            }, animatedStyle]}
            pointerEvents="none"
        />
    );
}
