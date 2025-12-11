import React, { useEffect } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface AnimatedTextProps {
    text: string;
    style?: TextStyle;
    duration?: number; // Duration for each character's bounce (default 400ms)
    staggerDelay?: number; // Delay between each character starting (default 150ms)
}

export default function AnimatedText({
    text,
    style,
    duration = 400,
    staggerDelay = 150
}: AnimatedTextProps): React.JSX.Element {
    const characters = text.split('');

    return (
        <View style={styles.container}>
            {characters.map((char, index) => (
                <AnimatedCharacter
                    key={index}
                    character={char}
                    index={index}
                    totalCharacters={characters.length}
                    style={style}
                    duration={duration}
                    staggerDelay={staggerDelay}
                />
            ))}
        </View>
    );
}

interface AnimatedCharacterProps {
    character: string;
    index: number;
    totalCharacters: number;
    style?: TextStyle;
    duration: number;
    staggerDelay: number;
}

function AnimatedCharacter({
    character,
    index,
    totalCharacters,
    style,
    duration,
    staggerDelay
}: AnimatedCharacterProps): React.JSX.Element {
    const bounce = useSharedValue(0);

    useEffect(() => {
        // Each character starts based on its index
        const characterDelay = staggerDelay * index;

        // Calculate pause needed so all characters reset together
        const pauseAfterBounce = (totalCharacters - 1) * staggerDelay - characterDelay;

        bounce.value = withRepeat(
            withSequence(
                // Wait for this character's turn
                withDelay(characterDelay,
                    withSequence(
                        withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
                        withTiming(0, { duration, easing: Easing.in(Easing.ease) })
                    )
                ),
                // Pause so all characters reset together
                withDelay(pauseAfterBounce + 200, withTiming(0, { duration: 0 }))
            ),
            -1, // Repeat indefinitely
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: bounce.value * -5 // Bounce up by 5px (reduced from 8)
            },
            {
                scale: 1 + bounce.value * 0.15 // Slight scale increase
            }
        ],
        opacity: 0.6 + bounce.value * 0.4 // Fade slightly
    }));

    return (
        <Animated.Text style={[style, animatedStyle]}>
            {character === ' ' ? '\u00A0' : character}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingLeft: 2,
    }
});
