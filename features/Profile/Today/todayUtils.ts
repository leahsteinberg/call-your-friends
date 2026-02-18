import { isBroadcastMeeting } from "@/features/Meetings/meetingHelpers";
import { ProcessedMeetingType } from "@/features/Meetings/types";
import { isBroadcastOffer } from "@/features/Offers/offerHelpers";
import { ProcessedOfferType } from "@/features/Offers/types";
import { PAST_MEETING_STATE } from "@/types/meetings-offers";

export type TodayItem = {
    id: string;
    type: 'meeting' | 'offer';
    displayScheduledFor: string;
    scheduledFor: string;
    data: ProcessedMeetingType | ProcessedOfferType;
};


export function sortTodayItemsWithBroadcastPriority(items: TodayItem[], userId: string): TodayItem[] {
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

    const sortByTime = (a: TodayItem, b: TodayItem) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();

    selfCreatedBroadcastMeetings.sort(sortByTime);
    broadcastOffers.sort(sortByTime);
    otherItems.sort(sortByTime);

    return [...selfCreatedBroadcastMeetings, ...broadcastOffers, ...otherItems];
}
