import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import React, { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

interface WheelPickerProps {
    items: string[];
    selectedIndex: number;
    onValueChange: (index: number) => void;
    itemHeight?: number;
}

export default function WheelPicker({
    items,
    selectedIndex,
    onValueChange,
    itemHeight = 40
}: WheelPickerProps): React.JSX.Element {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(selectedIndex);

    // Add padding items at the start and end to center the first and last items
    const paddedItems = ['', '', ...items, '', ''];
    const PADDING_OFFSET = 2;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / itemHeight);
        const actualIndex = index - PADDING_OFFSET;

        if (actualIndex >= 0 && actualIndex < items.length && actualIndex !== currentIndex) {
            setCurrentIndex(actualIndex);
            onValueChange(actualIndex);
        }
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / itemHeight);
        const actualIndex = Math.max(0, Math.min(items.length - 1, index - PADDING_OFFSET));

        // Snap to the nearest item
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                y: (actualIndex + PADDING_OFFSET) * itemHeight,
                animated: true
            });
        }

        if (actualIndex !== currentIndex) {
            setCurrentIndex(actualIndex);
            onValueChange(actualIndex);
        }
    };

    return (
        <View style={styles.container}>
            {/* Selection indicator overlay */}
            <View style={[styles.selectionIndicator, { height: itemHeight }]} pointerEvents="none" />

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEnd}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                contentOffset={{ x: 0, y: (selectedIndex + PADDING_OFFSET) * itemHeight }}
                contentContainerStyle={styles.listContent}
            >
                {paddedItems.map((item, index) => {
                    const actualIndex = index - PADDING_OFFSET;
                    const distance = Math.abs(actualIndex - currentIndex);

                    // Calculate scale and opacity based on distance from center
                    const scale = distance === 0 ? 1 : Math.max(0.6, 1 - distance * 0.2);
                    const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.35);

                    return (
                        <View key={`${item}-${index}`} style={[styles.itemContainer, { height: itemHeight }]}>
                            <Text
                                style={[
                                    styles.itemText,
                                    {
                                        transform: [{ scale }],
                                        opacity,
                                        fontWeight: distance === 0 ? '700' : '500',
                                    }
                                ]}
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
        height: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    listContent: {
        paddingVertical: 0,
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        textAlign: 'center',
    },
    selectionIndicator: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        left: 0,
        right: 0,
        backgroundColor: CREAM,
        opacity: 0.3,
        borderRadius: 8,
        zIndex: 1,
        pointerEvents: 'none',
    },
});
