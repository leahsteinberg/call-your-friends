import { MeetingEvent } from "../Meetings/types";

export interface OfferType extends MeetingEvent {
    meetingId: string;
    offerState: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    //scheduledFor: string;
}

export interface ProcessedOfferType extends OfferType {
    userFromName: string;
    displayScheduledFor: string;
}
