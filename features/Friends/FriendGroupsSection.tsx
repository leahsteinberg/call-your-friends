import Avatar from '@/components/Avatar/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomFonts } from '@/constants/theme';
import { useDeleteGroupMutation, useGetGroupsQuery } from '@/services/groupsApi';
import { BURGUNDY, CREAM, FUN_PURPLE } from '@/styles/styles';
import { RootState } from '@/types/redux';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function FriendGroupsSection() {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const { data: groups = [] } = useGetGroupsQuery({ userId });
    const [expanded, setExpanded] = useState(false);
    const [deleteGroup] = useDeleteGroupMutation();

    const handleDeleteGroup = (groupId: string, groupName: string) => {
        Alert.alert(
            'Delete Group',
            `Are you sure you want to delete "${groupName}"?`,
            [
                {
                    text: 'Never mind',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteGroup({ requesterId: userId, groupId }).unwrap();
                        } catch (error) {
                            console.error('Error deleting group:', error);
                            Alert.alert('Error', 'Failed to delete group. Please try again.');
                        }
                    },
                },
            ]
        );
    };

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
                        <View key={group.id} style={styles.groupContainer}>
                            <View style={styles.groupHeader}>
                                <View style={styles.groupDot} />
                                <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                                <Text style={styles.memberCount}>({group.members.length})</Text>
                                <TouchableOpacity
                                    onPress={() => handleDeleteGroup(group.id, group.name)}
                                    style={styles.deleteButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <IconSymbol name="trash" size={14} color={BURGUNDY} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.avatarScroll}
                                contentContainerStyle={styles.avatarScrollContent}
                            >
                                {group.members.map(member => (
                                    <View key={member.id} style={styles.avatarWrapper}>
                                        <Avatar
                                            name={member.user.name}
                                            avatarUrl={member.user.avatarUrl}
                                            size={40}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
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
        gap: 12,
    },
    groupContainer: {
        gap: 8,
    },
    groupHeader: {
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
    deleteButton: {
        padding: 4,
    },
    avatarScroll: {
        marginLeft: 14,
    },
    avatarScrollContent: {
        gap: 8,
        paddingRight: 14,
    },
    avatarWrapper: {
        alignItems: 'center',
    },
});
