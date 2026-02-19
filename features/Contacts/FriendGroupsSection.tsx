import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomFonts } from '@/constants/theme';
import { useGetGroupsQuery } from '@/services/groupsApi';
import { BURGUNDY, CREAM, FUN_PURPLE } from '@/styles/styles';
import { RootState } from '@/types/redux';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function FriendGroupsSection() {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const { data: groups = [] } = useGetGroupsQuery({ userId });
    const [expanded, setExpanded] = useState(false);

    if (groups.length === 0) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
                <Text style={styles.headerText}>Groups</Text>
                <IconSymbol
                    name={expanded ? 'chevron.up' : 'chevron.down'}
                    size={14}
                    color={BURGUNDY}
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.groupList}>
                    {groups.map(group => (
                        <View key={group.id} style={styles.groupRow}>
                            <View style={styles.groupDot} />
                            <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                            <Text style={styles.memberCount}>{group.members.length}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        marginBottom: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    headerText: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnaturebold,
        color: BURGUNDY,
        letterSpacing: 0.3,
    },
    groupList: {
        paddingHorizontal: 14,
        paddingBottom: 10,
        gap: 6,
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: FUN_PURPLE,
    },
    groupName: {
        flex: 1,
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: BURGUNDY,
    },
    memberCount: {
        fontSize: 11,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(57, 6, 23, 0.5)',
    },
});
