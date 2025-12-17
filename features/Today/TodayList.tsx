import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import BroadcastNowCard from "../EventCards/BroadcastNowCard";
import { selectMeetingCard, selectOfferCard } from "../EventCards/cardSelector";
import { isBroadcastMeeting } from "../Meetings/meetingHelpers";
import { ProcessedMeetingType } from "../Meetings/types";
import { ProcessedOfferType } from "../Offers/types";
import { sortTodayItemsWithBroadcastPriority, type TodayItem } from "./todayUtils";

function isToday(dateString: string): boolean {
    const itemDate = new Date(dateString);
    const today = new Date();

    return (
        itemDate.getFullYear() === today.getFullYear() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getDate() === today.getDate()
    );
}

export default function TodayList(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isBroadcasting: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [forceReprocess, setForceReprocess] = useState(0);

    // Use custom hooks for data fetching and processing
    const { meetings, refetch: refetchMeetings } = useProcessedMeetings();
    const { offers, refetch: refetchOffers } = useProcessedOffers(forceReprocess);

    // Check if there's an active self-created broadcast meeting (excluding PAST meetings)
    const hasSelfBroadcastMeeting = todayItems.some(item => {
        if (item.type === 'meeting') {
            const meeting = item.data as ProcessedMeetingType;
            return isBroadcastMeeting(meeting) &&
                   meeting.userFromId === userId &&
                   meeting.meetingState !== PAST_MEETING_STATE;
        }
        return false;
    });

    // Process and filter data when it changes
    useEffect(() => {
        const processData = async () => {
            try {
                // Filter for today and combine
                const todayMeetings: TodayItem[] = meetings
                    // .filter((meeting:ProcessedMeetingType )=> isToday(meeting.scheduledFor))
                    .map((meeting: ProcessedMeetingType) => ({
                        id: `meeting-${meeting.id}`,
                        type: 'meeting' as const,
                        displayScheduledFor: meeting.displayScheduledFor,
                        scheduledFor: meeting.scheduledFor,
                        data: meeting,
                    }));

                const todayOffers: TodayItem[] = offers
                    // .filter((offer: ProcessedOfferType) => isToday(offer.scheduledFor))
                    .map((offer: ProcessedOfferType) => ({
                        id: `offer-${offer.id}`,
                        type: 'offer' as const,
                        displayScheduledFor: offer.displayScheduledFor,
                        scheduledFor: offer.scheduledFor,
                        data: offer,
                    }));

                // Combine and sort by time
                const combined = sortTodayItemsWithBroadcastPriority([...todayOffers, ...todayMeetings], userId)
                

                setTodayItems(combined);
            } catch (error) {
                console.error("Error processing today's items:", error);
            }
        };

        processData();
    }, [meetings, offers]);

    // Manual refresh still available via pull-to-refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchMeetings(), refetchOffers()]);
        setForceReprocess(prev => prev + 1);
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: TodayItem }) => {
        if (item.type === 'meeting') {
            const meeting = item.data as ProcessedMeetingType;
            return selectMeetingCard(meeting, {userId, refresh: handleRefresh})
        } else {
            const offer = item.data as ProcessedOfferType;
            return selectOfferCard(offer, {refresh: handleRefresh});
        }
    };

    // Provide estimated item height to prevent layout shifts
    const getItemLayout = (_data: ArrayLike<TodayItem> | null | undefined, index: number) => ({
        length: 150, // Estimated average height of cards
        offset: 150 * index,
        index,
    });

    // Render header: BroadcastNowCard when not broadcasting
    const renderListHeader = () => {
        // Only hide BroadcastNowCard when SelfBroadcastCard actually exists in data
        // This prevents visual gaps during the transition
        if (!hasSelfBroadcastMeeting) {
            return <BroadcastNowCard />;
        }
        return null;
    };

    // Render empty state inside the list
    const renderEmptyComponent = () => {
        if (todayItems.length === 0 && !isBroadcasting && !hasSelfBroadcastMeeting) {
            return <Text style={styles.emptyText}>No meetings or offers for today</Text>;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.headerText}>Today</Text> */}
            <FlatList
                style={Platform.OS !== 'web' ? { overflow: 'visible' } : undefined}
                data={todayItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                getItemLayout={getItemLayout}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                contentContainerStyle={[
                    styles.listContent,
                    Platform.OS === 'web' && { paddingLeft: 11 }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 15,
        // marginVertical: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        //marginBottom: 12,
        fontFamily: CustomFonts.ztnaturemedium,
        position: 'relative', // Create stacking context
        zIndex: 100, // High z-index to sit above FlatList
        backgroundColor: CREAM, // Opaque background to hide content underneath
        // paddingBottom: 4, // Extra padding so background extends a bit

    },
    listContent: {
        paddingBottom: 16,
        paddingTop: 15,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});
