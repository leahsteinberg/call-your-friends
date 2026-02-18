import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { CREAM } from "@/styles/styles";
import { DRAFT_MEETING_STATE, PAST_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { isBroadcastMeeting } from "../Meetings/meetingHelpers";
import { isActiveOpenBroadcastMeeting } from "../Meetings/meetingsFilters";
import type { ProcessedMeetingType } from "../Meetings/types";
import type { ProcessedOfferType } from "../Offers/types";
import ClaimedBroadcastTile from "./ClaimedBroadcastTile";
import SelfBroadcastTile from "./SelfBroadcastTile";
import SelfClaimedBroadcastTile from "./SelfClaimedBroadcastTile";
import StartBroadcastTile from "./StartBroadcastTile";
import UnclaimedBroadcastTile from "./UnclaimedBroadcastTile";

type BroadcastItem =
    | { id: string; type: 'self'; data: ProcessedMeetingType | null }
    | { id: string; type: 'offer'; data: ProcessedOfferType }
    | { id: string; type: 'meeting'; data: ProcessedMeetingType };

export default function BroadcastList(): React.JSX.Element | null {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isBroadcasting: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [items, setItems] = useState<BroadcastItem[]>([]);

    const { meetings, isLoading: meetingsLoading } = useProcessedMeetings();
    const { offers } = useProcessedOffers();

    // Find the user's own active broadcast meeting
    const selfBroadcastMeeting = useMemo(() =>
        meetings.find((m: ProcessedMeetingType) =>
            isBroadcastMeeting(m) &&
            m.userFromId === userId &&
            m.meetingState !== PAST_MEETING_STATE &&
            m.meetingState !== DRAFT_MEETING_STATE

        ) || null,
        [meetings, userId]
    );

    useEffect(() => {
        // Self tile is always first
        const selfItem: BroadcastItem = {
            id: 'self-broadcast',
            type: 'self' as const,
            data: selfBroadcastMeeting,
        };

        // Claimed broadcasts: broadcast meetings created by others that this user accepted
        const claimedMeetings: BroadcastItem[] = meetings
            .filter((m: ProcessedMeetingType) =>
                isBroadcastMeeting(m) &&
                m.userFromId !== userId &&
                m.meetingState !== PAST_MEETING_STATE &&
                m.meetingState !== DRAFT_MEETING_STATE
            )
            .map((m: ProcessedMeetingType) => ({
                id: `meeting-${m.id}`,
                type: 'meeting' as const,
                data: m,
            }));

        // Unclaimed broadcasts: offers for active open broadcast meetings from others
        const unclaimedOffers: BroadcastItem[] = offers
            .filter((o: ProcessedOfferType) =>
                o.meeting && isActiveOpenBroadcastMeeting(o.meeting as any)
            )
            .map((o: ProcessedOfferType) => ({
                id: `offer-${o.id}`,
                type: 'offer' as const,
                data: o,
            }));

        setItems([selfItem, ...claimedMeetings, ...unclaimedOffers]);
    }, [meetings, offers, userId, selfBroadcastMeeting]);

    const renderItem = ({ item }: { item: BroadcastItem }) => {
        if (item.type === 'self') {
            const meeting = item.data as ProcessedMeetingType | null;
            if (!isBroadcasting || !meeting) {
                return <StartBroadcastTile />;
            }
            const hasAcceptedUsers = (meeting.acceptedUsers?.length ?? 0) > 0;
            if (hasAcceptedUsers) {
                return <SelfClaimedBroadcastTile meeting={meeting} />;
            }
            return <SelfBroadcastTile meeting={meeting} />;
        }
        if (item.type === 'offer') {
            return <UnclaimedBroadcastTile offer={item.data as ProcessedOfferType} />;
        }
        return <ClaimedBroadcastTile meeting={item.data as ProcessedMeetingType} />;
    };

    if (meetingsLoading) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Call them now</Text>
            <FlatList
                horizontal
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        marginHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CREAM,
        marginBottom: 10,
        opacity: 0.8,
    },
    listContent: {
        paddingRight: 15,
    },
    separator: {
        width: 10,
    },
});
