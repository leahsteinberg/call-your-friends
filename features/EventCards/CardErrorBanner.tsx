import { CustomFonts } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

// Extracts a human-readable message from RTK Query or generic errors.
// Prefers server-provided messages from the response body.
export function extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        const e = error as Record<string, any>;
        if (typeof e.data === 'object' && e.data !== null) {
            if (typeof e.data.message === 'string' && e.data.message) return e.data.message;
            if (typeof e.data.error === 'string' && e.data.error) return e.data.error;
        }
        if (typeof e.error === 'string' && e.error) return e.error;
        if (typeof e.message === 'string' && e.message) return e.message;
    }
    return 'Something went wrong. Please try again.';
}

interface CardErrorBannerProps {
    message: string;
}

// Rendered conditionally by parent: {error && <CardErrorBanner key={error} message={error} />}
// The key prop forces a remount (and fresh animation) if the error message changes.
export default function CardErrorBanner({ message }: CardErrorBannerProps): React.JSX.Element {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(6);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 200 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 130 });
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.container, animStyle]}>
            <Text style={styles.text} numberOfLines={2}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        backgroundColor: 'rgba(190, 35, 25, 0.88)',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 11,
    },
    text: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnatureregular,
        color: '#fff',
        lineHeight: 17,
    },
});
