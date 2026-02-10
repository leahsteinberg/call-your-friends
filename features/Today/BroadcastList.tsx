import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { isBroadcastMeeting } from "../Meetings/meetingHelpers";
import { isActiveOpenBroadcastMeeting } from "../Meetings/meetingsFilters";
import type { ProcessedMeetingType } from "../Meetings/types";
import type { ProcessedOfferType } from "../Offers/types";
import ClaimedBroadcastTile from "./ClaimedBroadcastTile";
import UnclaimedBroadcastTile from "./UnclaimedBroadcastTile";

type BroadcastItem =
    | { id: string; type: 'offer'; data: ProcessedOfferType }
    | { id: string; type: 'meeting'; data: ProcessedMeetingType };

export default function BroadcastList(): React.JSX.Element | null {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [items, setItems] = useState<BroadcastItem[]>([]);

    const { meetings } = useProcessedMeetings();
    const { offers } = useProcessedOffers();

    useEffect(() => {
        // Claimed broadcasts: broadcast meetings created by others that this user accepted
        const claimedMeetings: BroadcastItem[] = meetings
            .filter((m: ProcessedMeetingType) =>
                isBroadcastMeeting(m) &&
                m.userFromId !== userId &&
                m.meetingState !== PAST_MEETING_STATE
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

        setItems([...claimedMeetings, ...unclaimedOffers]);
    }, [meetings, offers, userId]);

    if (items.length === 0) return null;

    const renderItem = ({ item }: { item: BroadcastItem }) => {
        if (item.type === 'offer') {
            return <UnclaimedBroadcastTile offer={item.data as ProcessedOfferType} />;
        }
        return <ClaimedBroadcastTile meeting={item.data as ProcessedMeetingType} />;
    };

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
