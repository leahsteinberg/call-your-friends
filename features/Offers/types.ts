import { OfferState } from "@/types/meetings-offers";
import { BroadcastMetadata, MeetingEvent, MeetingType } from "../Meetings/types";

export type OfferTypeValue = 'ADVANCE' | 'BROADCAST';

export interface OfferType extends MeetingEvent {
    meetingId: string;
    offerState: OfferState;
    offerType: OfferTypeValue;
    //scheduledFor: string;
}

export interface ProcessedOfferType extends OfferType {
    userFromName: string;
    displayScheduledFor: string;
    displayExpiresAt: string;
    meeting?: MeetingType & {
        userFrom?: {
            name?: string;
            id?: string;
        };
        broadcastMetadata?: BroadcastMetadata;
    };
}
