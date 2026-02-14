import { CustomFonts } from "@/constants/theme";
import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types";
import { DRAFT_MEETING_STATE, PAST_MEETING_STATE } from "@/types/meetings-offers";
import React, { useEffect, useState } from "react";
import { Platform, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { selectMeetingCard, selectOfferCard } from "../EventCards/cardSelector";
import { isBroadcastMeeting } from "../Meetings/meetingHelpers";
import { ProcessedMeetingType } from "../Meetings/types";
import { ProcessedOfferType } from "../Offers/types";
import TodayListLoader from "./LoadingAnimations/TodayListLoader";
import { sortTodayItemsWithBroadcastPriority, type TodayItem } from "./todayUtils";

// ============================================
// DAY GROUPING HELPERS
// ============================================

function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function getDayLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, tomorrow)) return "Tomorrow";
    if (sameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

function getDateKey(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface TodaySection {
    title: string;
    data: TodayItem[];
}

function groupByDay(items: TodayItem[]): TodaySection[] {
    const groupMap = new Map<string, TodayItem[]>();
    const groupOrder: string[] = [];

    items.forEach(item => {
        const key = getDateKey(item.scheduledFor);
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
            groupOrder.push(key);
        }
        groupMap.get(key)!.push(item);
    });

    return groupOrder.map(key => {
        const data = groupMap.get(key)!;
        const date = new Date(data[0].scheduledFor);
        return { title: getDayLabel(date), data };
    });
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TodayList(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const isBroadcasting: boolean = useSelector((state: RootState) => state.broadcast.isBroadcasting);
    const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [forceReprocess, setForceReprocess] = useState(0);
    const insets = useSafeAreaInsets();

    // Use custom hooks for data fetching and processing
    const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useProcessedMeetings();
    const { offers, isLoading: offersLoading, refetch: refetchOffers } = useProcessedOffers(forceReprocess);

    const isLoading = meetingsLoading || offersLoading;

    // Check if there's an active self-created broadcast meeting (excluding PAST meetings)
    const hasSelfBroadcastMeeting = todayItems.some(item => {
        if (item.type === 'meeting') {
            const meeting = item.data as ProcessedMeetingType;
            return isBroadcastMeeting(meeting) &&
                   meeting.userFromId === userId &&
                   meeting.meetingState !== PAST_MEETING_STATE &&
                   meeting.meetingState !== DRAFT_MEETING_STATE;

        }
        return false;
    });

    // Check if the user has accepted another user's broadcast (excluding PAST meetings)
    const hasAcceptedOtherBroadcast = todayItems.some(item => {
        if (item.type === 'meeting') {
            const meeting = item.data as ProcessedMeetingType;
            return isBroadcastMeeting(meeting) &&
                   meeting.userFromId !== userId &&
                   meeting.meetingState !== PAST_MEETING_STATE;
        }
        return false;
    });

    // Process and filter data when it changes
    useEffect(() => {
        const processData = async () => {
            try {
                const todayMeetings: TodayItem[] = meetings
                    .map((meeting: ProcessedMeetingType) => ({
                        id: `meeting-${meeting.id}`,
                        type: 'meeting' as const,
                        displayScheduledFor: meeting.displayScheduledFor,
                        scheduledFor: meeting.scheduledFor,
                        data: meeting,
                    }));

                    console.log("raw meetings", todayMeetings)
                const todayOffers: TodayItem[] = offers
                    .map((offer: ProcessedOfferType) => ({
                        id: `offer-${offer.id}`,
                        type: 'offer' as const,
                        displayScheduledFor: offer.displayScheduledFor,
                        scheduledFor: offer.scheduledFor,
                        data: offer,
                    }));
                    console.log("raw offers", todayOffers);
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
            const card = selectMeetingCard(meeting, {userId, refresh: handleRefresh});

            // Wrap SelfBroadcastCard with pop-in animation
            if (isBroadcastMeeting(meeting) && meeting.userFromId === userId && meeting.meetingState !== PAST_MEETING_STATE) {
                return (
                    <View>
                        {card}
                    </View>
                );
            }

            return card;
        } else {
            const offer = item.data as ProcessedOfferType;
            return selectOfferCard(offer, {refresh: handleRefresh});
        }
    };

    const renderSectionHeader = ({ section }: { section: TodaySection }) => (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    );

    // Render empty state inside the list
    const renderEmptyComponent = () => {
        if (todayItems.length === 0 && !isBroadcasting && !hasSelfBroadcastMeeting && !hasAcceptedOtherBroadcast) {
            return <Text style={styles.emptyText}>No meetings or offers for today</Text>;
        }
        return null;
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <TodayListLoader />
            </View>
        );
    }

    const sections = groupByDay(todayItems);

    return (
        <View style={styles.container}>
            <SectionList
                style={Platform.OS !== 'web' ? { overflow: 'visible' } : undefined}
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={true}
                ListEmptyComponent={renderEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                contentContainerStyle={[
                    styles.listContent,
                    Platform.OS === 'web' && { paddingLeft: 11 },
                    { paddingBottom: insets.bottom + 80 }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 15,
    },
    sectionHeaderContainer: {
        backgroundColor: CREAM,
        paddingTop: 16,
        paddingBottom: 8,
        paddingHorizontal: 4,
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: BURGUNDY,
        fontFamily: CustomFonts.ztnaturebold,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: 0.5,
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
