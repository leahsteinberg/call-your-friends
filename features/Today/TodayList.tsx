import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { DARK_GREEN } from "@/styles/styles";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import MeetingCard from "../Common/MeetingCard";
import OfferCard from "../Common/OfferCard";
import { ProcessedMeetingType } from "../Meetings/types";
import { ProcessedOfferType } from "../Offers/types";
import BroadcastNowButton from "./BroadcastNowButton";

type TodayItem = {
    id: string;
    type: 'meeting' | 'offer';
    displayScheduledFor: string;
    scheduledFor: string;
    data: ProcessedMeetingType | ProcessedOfferType;
};

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
    const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [forceReprocess, setForceReprocess] = useState(0);

    // Use custom hooks for data fetching and processing
    const { meetings, refetch: refetchMeetings } = useProcessedMeetings();
    const { offers, refetch: refetchOffers } = useProcessedOffers(forceReprocess);

    // Process and filter data when it changes
    useEffect(() => {
        const processData = async () => {
            try {
                // Filter for today and combine
                const todayMeetings: TodayItem[] = meetings
                    .filter((meeting:ProcessedMeetingType )=> isToday(meeting.scheduledFor))
                    .map((meeting: ProcessedMeetingType) => ({
                        id: `meeting-${meeting.id}`,
                        type: 'meeting' as const,
                        displayScheduledFor: meeting.displayScheduledFor,
                        scheduledFor: meeting.scheduledFor,
                        data: meeting,
                    }));

                const todayOffers: TodayItem[] = offers
                    .filter((offer: ProcessedOfferType) => isToday(offer.scheduledFor))
                    .map((offer: ProcessedOfferType) => ({
                        id: `offer-${offer.id}`,
                        type: 'offer' as const,
                        displayScheduledFor: offer.displayScheduledFor,
                        scheduledFor: offer.scheduledFor,
                        data: offer,
                    }));

                // Combine and sort by time
                const combined = [...todayMeetings, ...todayOffers].sort(
                    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                );

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

    //const loading = meetingsLoading || offersLoading;

    const renderItem = ({ item }: { item: TodayItem }) => {
        if (item.type === 'meeting') {
            return <MeetingCard meeting={item.data as ProcessedMeetingType} />;
        } else {
            return <OfferCard offer={item.data as ProcessedOfferType} refresh={handleRefresh} />;
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Today</Text>
            <BroadcastNowButton />
            {todayItems.length === 0 ? (
                <Text style={styles.emptyText}>No meetings or offers for today</Text>
            ) : (
                <FlatList
                    data={todayItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 15,
        marginVertical: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});
