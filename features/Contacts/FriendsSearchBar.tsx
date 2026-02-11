import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { BlurView } from "expo-blur";
import React, { useRef } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FriendsSearchBarProps {
    query: string;
    onChangeQuery: (text: string) => void;
}

export default function FriendsSearchBar({ query, onChangeQuery }: FriendsSearchBarProps): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const handleClear = () => {
        onChangeQuery('');
        inputRef.current?.blur();
    };

    return (
        <View style={[styles.wrapper, { bottom: 108 }]}>
            {Platform.OS !== 'web' ? (
                <BlurView intensity={40} tint="light" style={styles.blurFill}>
                    <View style={styles.inputRow}>
                        <IconSymbol name="magnifyingglass" size={16} color="rgba(0,0,0,0.3)" />
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Search"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={query}
                            onChangeText={onChangeQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClear}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <View style={styles.clearButton}>
                                    <IconSymbol name="xmark" size={10} color="rgba(255,255,255,0.9)" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </BlurView>
            ) : (
                <View style={[styles.blurFill, styles.webFallback]}>
                    <View style={styles.inputRow}>
                        <IconSymbol name="magnifyingglass" size={16} color="rgba(0,0,0,0.3)" />
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Search"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={query}
                            onChangeText={onChangeQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClear}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <View style={styles.clearButton}>
                                    <IconSymbol name="xmark" size={10} color="rgba(255,255,255,0.9)" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    blurFill: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    webFallback: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'black',
        padding: 0,
    },
    clearButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
