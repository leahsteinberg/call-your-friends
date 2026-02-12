import Avatar from "@/components/Avatar/Avatar";
import { BroadcastTile } from "@/components/EventCard/BroadcastTile";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import { RootState } from "@/types/redux";
import React from "react";
import { useSelector } from "react-redux";

export default function StartBroadcastTile(): React.JSX.Element {
    const user = useSelector((state: RootState) => state.auth.user);
    const { handleStartBroadcast, isStarting, selectedVibe, setSelectedVibe } = useBroadcastSettings();

    const handleStart = async () => {
        try {
            await handleStartBroadcast();
        } catch (error) {
            alert('Failed to start broadcast. Please try again.');
        }
    };

    return (
        <BroadcastTile
            user={{ name: "Me", avatarUrl: user.avatarUrl, id: user.id }}
            timeRemainingText=""
            actionLabel="Call Me"
            actionIcon="phone.arrow.down.left"
            onAction={handleStart}
            isLoading={isStarting}
            avatarChildren={
                <Avatar.SpeechBubble
                    selectedVibe={selectedVibe}
                    onVibeSelect={setSelectedVibe}
                />
            }
        />
    );
}
