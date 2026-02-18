import { PAST_MEETING_STATE } from "@/types/meetings-offers";
import { isBroadcastMeeting } from "../Meetings/meetingHelpers";
import { ProcessedMeetingType } from "../Meetings/types";
import { isBroadcastOffer } from "../Offers/offerHelpers";
import { ProcessedOfferType } from "../Offers/types";

export type TodayItem = {
    id: string;
    type: 'meeting' | 'offer';
    displayScheduledFor: string;
    scheduledFor: string;
    data: ProcessedMeetingType | ProcessedOfferType;
};

/**
 * Pure function to sort today items with custom ordering:
 * 1. Self-created broadcast meetings first
 * 2. Broadcast offers in chronological order (earliest to latest)
 * 3. All other meetings and offers in chronological order (soonest to latest)
 *
 * @param items - Array of TodayItem to sort
 * @param userId - The current user's ID to identify self-created items
 * @returns Sorted array of TodayItem
 */
export function sortTodayItemsWithBroadcastPriority(items: TodayItem[], userId: string): TodayItem[] {
    // Separate items into three categories
    const selfCreatedBroadcastMeetings: TodayItem[] = [];
    const broadcastOffers: TodayItem[] = [];
    const otherItems: TodayItem[] = [];

    items.forEach(item => {
        if (item.type === 'meeting') {
            const meeting = item.data as ProcessedMeetingType;
            if (isBroadcastMeeting(meeting) && meeting.userFromId === userId && meeting.meetingState !== PAST_MEETING_STATE) {
                selfCreatedBroadcastMeetings.push(item);
            } else {
                otherItems.push(item);
            }
        } else if (item.type === 'offer') {
            const offer = item.data as ProcessedOfferType;
            if (isBroadcastOffer(offer)) {
                broadcastOffers.push(item);
            } else {
                otherItems.push(item);
            }
        }
    });

    // Sort each category by scheduledFor time (earliest to latest)
    const sortByTime = (a: TodayItem, b: TodayItem) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();

    selfCreatedBroadcastMeetings.sort(sortByTime);
    broadcastOffers.sort(sortByTime);
    otherItems.sort(sortByTime);

    // Combine in the desired order
    return [...selfCreatedBroadcastMeetings, ...broadcastOffers, ...otherItems];
}
