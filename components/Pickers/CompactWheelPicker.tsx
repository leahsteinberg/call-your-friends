import { CustomFonts } from "@/constants/theme";
import { BOLD_BROWN, CREAM } from "@/styles/styles";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

interface CompactWheelPickerProps {
    items: string[];
    selectedIndex: number;
    onValueChange: (index: number) => void;
    itemWidth?: number;
    height?: number;
}

export default function CompactWheelPicker({
    items,
    selectedIndex,
    onValueChange,
    itemWidth = 100,
    height = 40
}: CompactWheelPickerProps): React.JSX.Element {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    const lastHapticIndex = useRef(selectedIndex);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Only 1 padding item for more compact view
    const paddedItems = ['', ...items, ''];
    const PADDING_OFFSET = 1;

    // The visible width should show exactly 1.4 items (0.2 + 1 + 0.2)
    const containerWidth = itemWidth * 1.4;

    useEffect(() => {
        // Scroll to initial position on mount
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: (selectedIndex + PADDING_OFFSET) * itemWidth,
                animated: false
            });
        }
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / itemWidth);
        const actualIndex = index - PADDING_OFFSET;

        if (actualIndex >= 0 && actualIndex < items.length) {
            const newIndex = actualIndex;
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);

                // Haptic feedback when crossing into a new item
                if (Platform.OS !== 'web' && lastHapticIndex.current !== newIndex) {
                    Haptics.selectionAsync();
                    lastHapticIndex.current = newIndex;
                }
            }
        }
    };

    const snapToNearestItem = (offsetX: number) => {
        const index = Math.round(offsetX / itemWidth);
        const actualIndex = Math.max(0, Math.min(items.length - 1, index - PADDING_OFFSET));

        // Strong snap to center
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: (actualIndex + PADDING_OFFSET) * itemWidth,
                animated: true
            });
        }

        if (actualIndex !== currentIndex) {
            setCurrentIndex(actualIndex);
            onValueChange(actualIndex);

            // Haptic feedback on snap lock
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        snapToNearestItem(offsetX);
    };

    // Auto-snap if user stops scrolling mid-way
    const handleScrollWithTimeout = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        handleScroll(event);

        // Read the offset before the timeout (event pooling issue)
        const offsetX = event.nativeEvent.contentOffset.x;

        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
            snapToNearestItem(offsetX);
        }, 150);
    };

    return (
        <View style={[styles.container, { width: containerWidth, height }]}>
            {/* Selection indicator - fixed in center */}
            <View
                style={[
                    styles.selectionIndicator,
                    {
                        width: itemWidth,
                        left: itemWidth * 0.2,
                    }
                ]}
                pointerEvents="none"
            />

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={itemWidth}
                decelerationRate="fast"
                onScroll={handleScrollWithTimeout}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
            >
                {paddedItems.map((item, index) => {
                    const actualIndex = index - PADDING_OFFSET;
                    const distance = Math.abs(actualIndex - currentIndex);

                    // Scale and opacity for slot machine effect
                    const scale = distance === 0 ? 1 : 0.5;
                    const opacity = distance === 0 ? 1 : 0.15;

                    return (
                        <View key={`${item}-${index}`} style={[styles.itemContainer, { width: itemWidth }]}>
                            <Text
                                style={[
                                    styles.itemText,
                                    {
                                        transform: [{ scale }],
                                        opacity,
                                        fontWeight: distance === 0 ? '700' : '400',
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {item}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    listContent: {
        paddingHorizontal: 0,
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        color: BOLD_BROWN,
        fontFamily: CustomFonts.ztnaturebold,
        textAlign: 'center',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: CREAM,
        opacity: 0.2,
        borderRadius: 6,
        zIndex: 1,
        pointerEvents: 'none',
    },
});
