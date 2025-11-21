import { MeetingEvent } from "../Meetings/types";
import { OfferState } from "@/types/meetings-offers";

export interface OfferType extends MeetingEvent {
    meetingId: string;
    offerState: OfferState;
    //scheduledFor: string;
}

export interface ProcessedOfferType extends OfferType {
    userFromName: string;
    displayScheduledFor: string;
    displayExpiresAt: string;
}
