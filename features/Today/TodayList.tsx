import { useGetMeetingsQuery } from "@/services/meetingApi";
import { useGetOffersQuery } from "@/services/offersApi";
import { DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCard from "../Common/MeetingCard";
import OfferCard from "../Common/OfferCard";
import { processMeetings, processOffers } from "../Meetings/meetingsUtils";
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
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    // Query hooks automatically fetch on mount and return { data, isLoading, refetch }
    // They also auto-refetch when their tags are invalidated!
    const {
        data: meetings = [],
        isLoading: meetingsLoading,
        refetch: refetchMeetings
    } = useGetMeetingsQuery({ userFromId: userId });

    const {
        data: offers = [],
        isLoading: offersLoading,
        refetch: refetchOffers
    } = useGetOffersQuery({ userId });

    const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Process and filter data when it changes
    useEffect(() => {
        const processData = async () => {
            try {
                const processedMeetings = await processMeetings(meetings);
                const processedOffers = await processOffers(offers);

                // Filter for today and combine
                const todayMeetings: TodayItem[] = processedMeetings
                    .filter(meeting => isToday(meeting.scheduledFor))
                    .map(meeting => ({
                        id: `meeting-${meeting.id}`,
                        type: 'meeting' as const,
                        displayScheduledFor: meeting.displayScheduledFor,
                        scheduledFor: meeting.scheduledFor,
                        data: meeting,
                    }));

                const todayOffers: TodayItem[] = processedOffers
                    .filter(offer => isToday(offer.scheduledFor))
                    .map(offer => ({
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

        if (!meetingsLoading && !offersLoading) {
            processData();
        }
    }, [meetings, offers, meetingsLoading, offersLoading]);

    // Manual refresh still available via pull-to-refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchMeetings(), refetchOffers()]);
        setRefreshing(false);
    };

    const loading = meetingsLoading || offersLoading;

    const renderItem = ({ item }: { item: TodayItem }) => {
        if (item.type === 'meeting') {
            return <MeetingCard meeting={item.data as ProcessedMeetingType} />;
        } else {
            return <OfferCard offer={item.data as ProcessedOfferType} />;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>Today</Text>
                <BroadcastNowButton />
                <Text style={styles.emptyText}>Loading...</Text>
            </View>
        );
    }

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
