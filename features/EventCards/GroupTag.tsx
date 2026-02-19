import { CustomFonts } from '@/constants/theme';
import { FUN_PURPLE } from '@/styles/styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GroupTagProps {
    groupName: string;
}

export default function GroupTag({ groupName }: GroupTagProps): React.JSX.Element {
    return (
        <View style={styles.tag}>
            <Text style={styles.text} numberOfLines={1}>{groupName}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tag: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 10,
        fontFamily: CustomFonts.ztnaturebold,
        color: FUN_PURPLE,
        letterSpacing: 0.3,
    },
});
