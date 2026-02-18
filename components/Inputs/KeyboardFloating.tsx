import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface KeyboardFloatingProps {
    children: React.ReactNode;
    /** Bottom offset when the keyboard is hidden. Defaults to 108 (standard tab bar height). */
    defaultBottom?: number;
    /** Extra gap between the keyboard top and the component. Defaults to 8. */
    keyboardGap?: number;
    style?: ViewStyle;
}

export default function KeyboardFloating({
    children,
    defaultBottom = 108,
    keyboardGap = 8,
    style,
}: KeyboardFloatingProps): React.JSX.Element {
    const keyboardHeight = useKeyboardOffset();
    const bottom = keyboardHeight > 0 ? keyboardHeight + keyboardGap : defaultBottom;

    return (
        <View style={[styles.wrapper, { bottom }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
});
