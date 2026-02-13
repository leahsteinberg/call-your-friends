import type { Friend } from "@/features/Contacts/types";
import { isActiveClaimedSelfBroadcastMeeting, isActiveOpenBroadcastMeeting } from "@/features/Meetings/meetingsFilters";
import type { ProcessedMeetingType } from "@/features/Meetings/types";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useGetFriendsMutation } from "@/services/contactsApi";
import { useBroadcastEndMutation, useBroadcastNowMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import { determineTargetType } from "@/utils/broadcastUtils";
import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { endBroadcast, startBroadcast } from "./broadcastSlice";

interface BroadcastSettingsContextType {
    // State
    selectedVibe: string | null;
    selectedFriendIds: string[];
    friends: Friend[];
    isStarting: boolean;
    isCustomizing: boolean;

    // Self-broadcast derived state
    selfBroadcastMeeting: ProcessedMeetingType | undefined;
    isSelfBroadcastClaimed: boolean;
    hasUnclaimedSelfBroadcast: boolean;

    // Actions
    setSelectedVibe: (vibe: string | null) => void;
    setSelectedFriendIds: (ids: string[]) => void;
    setIsCustomizing: (value: boolean) => void;
    handleStartBroadcast: () => Promise<void>;
    handleEndBroadcast: () => Promise<void>;
    refetchFriends: () => Promise<void>;
}

const BroadcastSettingsContext = createContext<BroadcastSettingsContextType | null>(null);

export function useBroadcastSettings() {
    const context = useContext(BroadcastSettingsContext);
    if (!context) {
        throw new Error("useBroadcastSettings must be used within a BroadcastSettingsProvider");
    }
    return context;
}

interface BroadcastSettingsProviderProps {
    children: React.ReactNode;
}

export function BroadcastSettingsProvider({ children }: BroadcastSettingsProviderProps) {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.user.id);

    // Shared broadcast settings state
    const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isStarting, setIsStarting] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);

    // API mutations
    const [broadcastNow] = useBroadcastNowMutation();
    const [broadcastEnd] = useBroadcastEndMutation();
    const [getFriends] = useGetFriendsMutation();

    // Derive self-broadcast state from meetings
    const { meetings } = useProcessedMeetings();

    const selfBroadcastMeeting = useMemo(() => {
        // Find user's own active open broadcast
        const openBroadcast = meetings.find(
            m => m.userFromId === userId && isActiveOpenBroadcastMeeting(m)
        );
        if (openBroadcast) return openBroadcast;

        // Or find user's own claimed broadcast
        const claimedFilter = isActiveClaimedSelfBroadcastMeeting(userId);
        return meetings.find(claimedFilter);
    }, [meetings, userId]);

    const isSelfBroadcastClaimed = useMemo(() => {
        const claimedFilter = isActiveClaimedSelfBroadcastMeeting(userId);
        return meetings.some(claimedFilter);
    }, [meetings, userId]);

    const hasUnclaimedSelfBroadcast = useMemo(() => {
        return meetings.some(
            m => m.userFromId === userId && isActiveOpenBroadcastMeeting(m)
        );
    }, [meetings, userId]);

    // Fetch friends on mount
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsResult = await getFriends({ id: userId }).unwrap();
                setFriends(friendsResult || []);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        if (userId) {
            fetchFriends();
        }
    }, [userId, getFriends]);

    const refetchFriends = useCallback(async () => {
        try {
            const friendsResult = await getFriends({ id: userId }).unwrap();
            setFriends(friendsResult || []);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }, [userId, getFriends]);

    const handleStartBroadcast = useCallback(async () => {
        try {
            setIsStarting(true);
            const targetType = determineTargetType(selectedFriendIds);

            await broadcastNow({
                userId,
                targetUserIds: selectedFriendIds.length > 0 ? selectedFriendIds : undefined,
                targetType,
                intentLabel: selectedVibe,
            }).unwrap();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsCustomizing(false);
            dispatch(startBroadcast());
        } catch (error) {
            console.error("Error starting broadcast:", error);
            throw error;
        } finally {
            setIsStarting(false);
        }
    }, [userId, selectedFriendIds, selectedVibe, broadcastNow, dispatch]);

    const handleEndBroadcast = useCallback(async () => {
        setIsCustomizing(false);
        dispatch(endBroadcast());
        try {
            await broadcastEnd({ userId }).unwrap();
        } catch (error) {
            console.error("Error ending broadcast:", error);
        }
    }, [userId, broadcastEnd, dispatch]);

    const value: BroadcastSettingsContextType = {
        selectedVibe,
        selectedFriendIds,
        friends,
        isStarting,
        isCustomizing,
        selfBroadcastMeeting,
        isSelfBroadcastClaimed,
        hasUnclaimedSelfBroadcast,
        setSelectedVibe,
        setSelectedFriendIds,
        setIsCustomizing,
        handleStartBroadcast,
        handleEndBroadcast,
        refetchFriends,
    };

    return (
        <BroadcastSettingsContext.Provider value={value}>
            {children}
        </BroadcastSettingsContext.Provider>
    );
}
