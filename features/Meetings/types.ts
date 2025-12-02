import { BaseEntity } from "@/types/common";
import { ProcessedOfferType } from "../Offers/types";

export type MeetingTypeValue = 'ADVANCE' | 'BROADCAST';

export type BroadcastSubState = 'CLAIMED' | 'UNCLAIMED' | 'PENDING_CLAIMED';

export interface BroadcastMetadata {
    subState: BroadcastSubState;
    offerClaimedId?: string; // userId of person who claimed/pending claimed
}

export interface MeetingEvent extends BaseEntity {
    displayScheduledFor: string;
    scheduledFor: string;
    scheduledEnd: string;
    userFromId: string;
}

export interface MeetingType extends MeetingEvent {
    meetingState: 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST';
    meetingType: MeetingTypeValue;
    title: string;
    broadcastMetadata?: BroadcastMetadata;
}

export interface ProcessedMeetingType extends MeetingType {
    displayScheduledFor: string;
    acceptedUser?: {
        name?: string;
        id?: string;
    };
    userFrom?: {
        name?: string;
        id?: string;
    };
}

export interface MeetingsListProps {
    meetings: ProcessedMeetingType[];
    offers: ProcessedOfferType[];
    refresh: () => void;
    refreshing: boolean;
}

export interface MeetingDisplayProps {
    meeting: {
        item: ProcessedMeetingType;
        index: number;
    };
    refreshMeetings?: () => void;
}

export type MeetingState = 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST';

