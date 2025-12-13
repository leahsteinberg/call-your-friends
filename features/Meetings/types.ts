import { BaseEntity } from "@/types/common";
import { ProcessedOfferType } from "../Offers/types";

// NEW: Multi-dimensional meeting classification
export type TimeType = 'IMMEDIATE' | 'FUTURE' | 'UNKNOWN';
export type TargetType = 'OPEN' | 'FRIEND_SPECIFIC' | 'GROUP';
export type SourceType = 'USER_INTENT' | 'SYSTEM_PATTERN' | 'SYSTEM_REAL_TIME';

export type BroadcastSubState = 'CLAIMED' | 'UNCLAIMED' | 'PENDING_CLAIMED';

export interface BroadcastMetadata {
    subState: BroadcastSubState;
    offerClaimedId?: string; // userId of person who claimed/pending claimed
    pendingAt?: string; // NEW: timestamp when broadcast was claimed as pending
}

export interface MeetingEvent extends BaseEntity {
    displayScheduledFor: string;
    scheduledFor: string;
    scheduledEnd: string;
    userFromId: string;
}

export interface MeetingType extends MeetingEvent {
    meetingState: 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST' | 'DRAFT' | 'EXPIRED';

    // NEW: Multi-dimensional fields replace meetingType
    timeType: TimeType;
    targetType: TargetType;
    sourceType: SourceType;
    intentLabel?: string;
    targetUserId?: string;

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

export type MeetingState = 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST' | 'DRAFT' | 'EXPIRED';

