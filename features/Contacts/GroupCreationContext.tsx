import { useCreateGroupMutation } from '@/services/groupsApi';
import { RootState } from '@/types/redux';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useSelector } from 'react-redux';

interface GroupCreationContextValue {
    isCreating: boolean;
    groupName: string;
    selectedIds: Set<string>;
    canSave: boolean;
    isSaving: boolean;
    startCreating: () => void;
    cancelCreating: () => void;
    setGroupName: (name: string) => void;
    toggleFriend: (id: string) => void;
    saveGroup: () => Promise<void>;
}

const GroupCreationContext = createContext<GroupCreationContextValue | null>(null);

export function useGroupCreation() {
    const ctx = useContext(GroupCreationContext);
    if (!ctx) throw new Error('useGroupCreation must be used within GroupCreationProvider');
    return ctx;
}

export function GroupCreationProvider({ children }: { children: React.ReactNode }) {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [createGroup, { isLoading: isSaving }] = useCreateGroupMutation();

    const [isCreating, setIsCreating] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const canSave = groupName.trim().length >= 2 && selectedIds.size >= 2;

    const startCreating = useCallback(() => setIsCreating(true), []);

    const cancelCreating = useCallback(() => {
        setIsCreating(false);
        setGroupName('');
        setSelectedIds(new Set());
    }, []);

    const toggleFriend = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const saveGroup = useCallback(async () => {
        if (!canSave) return;
        try {
            await createGroup({
                userId,
                name: groupName.trim(),
                memberIds: [...selectedIds],
            }).unwrap();
            cancelCreating();
        } catch {
            // error handled by RTK Query
        }
    }, [canSave, createGroup, userId, groupName, selectedIds, cancelCreating]);

    return (
        <GroupCreationContext.Provider value={{
            isCreating, groupName, selectedIds, canSave, isSaving,
            startCreating, cancelCreating, setGroupName, toggleFriend, saveGroup,
        }}>
            {children}
        </GroupCreationContext.Provider>
    );
}
