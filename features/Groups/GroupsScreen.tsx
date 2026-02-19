import Avatar from '@/components/Avatar/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomFonts } from '@/constants/theme';
import {
    Group,
    GroupMember,
    useAddGroupMemberMutation,
    useCreateGroupMutation,
    useDeleteGroupMutation,
    useGetGroupsQuery,
    useRemoveGroupMemberMutation,
} from '@/services/groupsApi';
import { BURGUNDY, CREAM, FUN_PURPLE, PALE_BLUE } from '@/styles/styles';
import { RootState } from '@/types/redux';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

// ─── Member Row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
    member: GroupMember;
    canRemove: boolean;
    onRemove: () => void;
    isRemoving: boolean;
}

function MemberRow({ member, canRemove, onRemove, isRemoving }: MemberRowProps) {
    return (
        <View style={styles.memberRow}>
            <Avatar name={member.displayUsername} avatarUrl={member.avatarUrl} size={36} />
            <Text style={styles.memberName} numberOfLines={1}>{member.displayUsername}</Text>
            {canRemove && (
                <TouchableOpacity onPress={onRemove} disabled={isRemoving} style={styles.removeButton}>
                    {isRemoving
                        ? <ActivityIndicator size="small" color={BURGUNDY} />
                        : <IconSymbol name="xmark" size={12} color={BURGUNDY} />
                    }
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Add Member Form ──────────────────────────────────────────────────────────

interface AddMemberFormProps {
    groupId: string;
    requesterId: string;
}

function AddMemberForm({ groupId, requesterId }: AddMemberFormProps) {
    const [userId, setUserId] = useState('');
    const [addGroupMember, { isLoading }] = useAddGroupMemberMutation();

    const handleAdd = async () => {
        const trimmed = userId.trim();
        if (!trimmed) return;
        try {
            await addGroupMember({ requesterId, groupId, userId: trimmed }).unwrap();
            setUserId('');
        } catch {
            // error handled by RTK Query
        }
    };

    return (
        <View style={styles.addMemberRow}>
            <TextInput
                style={styles.addMemberInput}
                placeholder="User ID to add…"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity onPress={handleAdd} disabled={isLoading || !userId.trim()} style={styles.addButton}>
                {isLoading
                    ? <ActivityIndicator size="small" color={CREAM} />
                    : <IconSymbol name="plus" size={14} color={CREAM} />
                }
            </TouchableOpacity>
        </View>
    );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

interface GroupCardProps {
    group: Group;
    currentUserId: string;
}

function GroupCard({ group, currentUserId }: GroupCardProps) {
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [removeGroupMember] = useRemoveGroupMemberMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const isOwner = group.ownerId === currentUserId;

    const handleRemoveMember = async (memberId: string) => {
        setRemovingIds(prev => new Set(prev).add(memberId));
        try {
            await removeGroupMember({ requesterId: currentUserId, groupId: group.id, userId: memberId }).unwrap();
        } finally {
            setRemovingIds(prev => { const s = new Set(prev); s.delete(memberId); return s; });
        }
    };

    const handleDeleteGroup = async () => {
        setIsDeletingGroup(true);
        try {
            await deleteGroup({ requesterId: currentUserId, groupId: group.id }).unwrap();
        } catch {
            setIsDeletingGroup(false);
        }
    };

    return (
        <View style={styles.groupCard}>
            <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                {isOwner && (
                    <TouchableOpacity onPress={handleDeleteGroup} disabled={isDeletingGroup} style={styles.deleteButton}>
                        {isDeletingGroup
                            ? <ActivityIndicator size="small" color={BURGUNDY} />
                            : <IconSymbol name="trash" size={14} color={BURGUNDY} />
                        }
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.memberList}>
                {group.members.map(member => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        canRemove={isOwner && member.id !== currentUserId}
                        onRemove={() => handleRemoveMember(member.id)}
                        isRemoving={removingIds.has(member.id)}
                    />
                ))}
            </View>

            {isOwner && <AddMemberForm groupId={group.id} requesterId={currentUserId} />}
        </View>
    );
}

// ─── Create Group Form ────────────────────────────────────────────────────────

interface CreateGroupFormProps {
    userId: string;
    onDismiss: () => void;
}

function CreateGroupForm({ userId, onDismiss }: CreateGroupFormProps) {
    const [name, setName] = useState('');
    const [createGroup, { isLoading }] = useCreateGroupMutation();

    const handleCreate = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        try {
            await createGroup({ userId, name: trimmed }).unwrap();
            setName('');
            onDismiss();
        } catch {
            // error handled by RTK Query
        }
    };

    return (
        <View style={styles.createForm}>
            <TextInput
                style={styles.createInput}
                placeholder="Group name…"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
            />
            <View style={styles.createFormButtons}>
                <TouchableOpacity onPress={onDismiss} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate} disabled={isLoading || !name.trim()} style={styles.createButton}>
                    {isLoading
                        ? <ActivityIndicator size="small" color={CREAM} />
                        : <Text style={styles.createButtonText}>Create</Text>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroupsScreen(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const { data: groups = [], isLoading } = useGetGroupsQuery({ userId });
    const [showCreateForm, setShowCreateForm] = useState(false);

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <Text style={styles.title}>Groups</Text>
                {!showCreateForm && (
                    <TouchableOpacity onPress={() => setShowCreateForm(true)} style={styles.newGroupButton}>
                        <IconSymbol name="plus" size={14} color={CREAM} />
                        <Text style={styles.newGroupText}>New Group</Text>
                    </TouchableOpacity>
                )}
            </View>

            {showCreateForm && (
                <CreateGroupForm userId={userId} onDismiss={() => setShowCreateForm(false)} />
            )}

            {isLoading ? (
                <ActivityIndicator style={styles.loader} color={CREAM} />
            ) : groups.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No groups yet.</Text>
                    <Text style={styles.emptySubtext}>Create one to call multiple friends at once.</Text>
                </View>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={g => g.id}
                    renderItem={({ item }) => <GroupCard group={item} currentUserId={userId} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    title: {
        fontSize: 26,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    newGroupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: FUN_PURPLE,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    newGroupText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    loader: {
        marginTop: 40,
    },
    list: {
        gap: 12,
        paddingBottom: 120,
    },
    // ── Group Card
    groupCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    groupName: {
        fontSize: 17,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
        flex: 1,
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(57, 6, 23, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Members
    memberList: {
        gap: 8,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    memberName: {
        flex: 1,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        color: CREAM,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(57, 6, 23, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Add Member
    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    addMemberInput: {
        flex: 1,
        height: 36,
        backgroundColor: PALE_BLUE,
        borderRadius: 10,
        paddingHorizontal: 10,
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: '#262626',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: FUN_PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Create Group Form
    createForm: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        gap: 10,
        marginBottom: 12,
    },
    createInput: {
        height: 40,
        backgroundColor: PALE_BLUE,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        color: '#262626',
    },
    createFormButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cancelButtonText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    createButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: FUN_PURPLE,
    },
    createButtonText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    // ── Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    emptySubtext: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(254,251,234,0.6)',
        textAlign: 'center',
    },
});
