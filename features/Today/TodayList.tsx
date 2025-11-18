import { useGetMeetingsQuery } from "@/services/meetingApi";
import { useGetOffersQuery } from "@/services/offersApi";
import { CREAM, DARK_GREEN, LIGHT_BEIGE, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
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
            const meeting = item.data as ProcessedMeetingType;
            const selfCreatedMeeting = meeting.userFromId === userId;

            // Get the name to display based on who created the meeting
            const getName = () => {
                if (selfCreatedMeeting) {
                    const name = meeting.acceptedUser?.name;
                    return name ? `with: ${name}` : null;
                } else {
                    const name = meeting.userFrom?.name;
                    return name ? `from: ${name}` : null;
                }
            };

            const nameDisplay = getName();

            return (
                <View style={styles.itemContainer}>
                    <View style={styles.typeIndicator}>
                        <Text style={styles.typeText}>Meeting</Text>
                    </View>
                    <Text style={styles.timeText}>{meeting.displayScheduledFor}</Text>
                    {nameDisplay && (
                        <Text style={styles.nameText}>{nameDisplay}</Text>
                    )}
                    <Text style={styles.statusText}>
                        Status: {meeting.meetingState}
                    </Text>
                </View>
            );
        } else {
            const offer = item.data as ProcessedOfferType;
            return (
                <View style={[styles.itemContainer, styles.offerContainer]}>
                    <View style={[styles.typeIndicator, styles.offerIndicator]}>
                        <Text style={styles.typeText}>Offer</Text>
                    </View>
                    <Text style={styles.timeText}>{offer.displayScheduledFor}</Text>
                    <Text style={styles.nameText}>
                        from: {offer.meeting?.userFrom?.name || offer.userFromName}
                    </Text>
                    <Text style={styles.statusText}>
                        Status: {offer.offerState}
                    </Text>
                </View>
            );
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
    itemContainer: {
        backgroundColor: LIGHT_BEIGE,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    offerContainer: {
        backgroundColor: PALE_BLUE,
    },
    typeIndicator: {
        backgroundColor: DARK_GREEN,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    offerIndicator: {
        backgroundColor: '#5a7d9a',
    },
    typeText: {
        color: CREAM,
        fontSize: 12,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: DARK_GREEN,
        marginBottom: 4,
    },
    nameText: {
        fontSize: 14,
        fontWeight: '600',
        color: ORANGE,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});
