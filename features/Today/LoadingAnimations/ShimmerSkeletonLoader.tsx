import { BOLD_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export default function ShimmerSkeletonLoader(): React.JSX.Element {
    const shimmerTranslate = useSharedValue(-200);

    useEffect(() => {
        shimmerTranslate.value = withRepeat(
            withTiming(200, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerTranslate.value }],
    }));

    const SkeletonCard = () => (
        <View style={styles.skeletonCard}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
            <View style={styles.skeletonHeader}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonButton} />
            </View>
            <View style={styles.skeletonBody}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingTop: 15,
    },
    skeletonCard: {
        backgroundColor: PALE_BLUE,
        borderRadius: 30,
        padding: 20,
        minHeight: 140,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 3,
        borderColor: BOLD_BLUE,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 200,
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    skeletonTitle: {
        width: '60%',
        height: 24,
        backgroundColor: BOLD_BLUE,
        borderRadius: 8,
        opacity: 0.3,
    },
    skeletonButton: {
        width: 60,
        height: 28,
        backgroundColor: BOLD_BLUE,
        borderRadius: 14,
        opacity: 0.3,
    },
    skeletonBody: {
        gap: 8,
    },
    skeletonLine: {
        width: '100%',
        height: 16,
        backgroundColor: BOLD_BLUE,
        borderRadius: 8,
        opacity: 0.2,
    },
    skeletonLineShort: {
        width: '70%',
    },
});
