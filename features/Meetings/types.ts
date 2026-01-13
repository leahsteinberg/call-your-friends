import { BaseEntity } from "@/types/common";
import { ProcessedOfferType } from "../Offers/types";

// NEW: Multi-dimensional meeting classification
export type TimeType = "IMMEDIATE" | "FUTURE" | "UNKNOWN";
export type TargetType = "OPEN" | "FRIEND_SPECIFIC" | "GROUP";
export type SourceType = "USER_INTENT" | "SYSTEM_PATTERN" | "SYSTEM_REAL_TIME";

export type BroadcastSubState = "PENDING_CLAIMED" | "UNCLAIMED" | "CLAIMED";

// Time Type Constants (type-safe with assertions)
export const IMMEDIATE_TIME_TYPE: TimeType = 'IMMEDIATE' as const;
export const FUTURE_TIME_TYPE: TimeType = 'FUTURE' as const;
export const UNKNOWN_TIME_TYPE: TimeType = 'UNKNOWN' as const;

// Target Type Constants (type-safe with assertions)
export const OPEN_TARGET_TYPE: TargetType = 'OPEN' as const;
export const FRIEND_SPECIFIC_TARGET_TYPE: TargetType = 'FRIEND_SPECIFIC' as const;
export const GROUP_TARGET_TYPE: TargetType = 'GROUP' as const;

// Source Type Constants (type-safe with assertions)
export const USER_INTENT_SOURCE_TYPE: SourceType = 'USER_INTENT' as const;
export const SYSTEM_PATTERN_SOURCE_TYPE: SourceType = 'SYSTEM_PATTERN' as const;
export const SYSTEM_REAL_TIME_SOURCE_TYPE: SourceType = 'SYSTEM_REAL_TIME' as const;

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

export type MeetingState = "DRAFT" | "SEARCHING" | "ACCEPTED" | "REJECTED" | "PAST" | "EXPIRED" | "DISMISSED_DRAFT" | "CANCELED";

export interface MeetingType extends MeetingEvent {
    meetingState: MeetingState;

    // NEW: Multi-dimensional fields replace meetingType
    timeType: TimeType;
    targetType: TargetType;
    sourceType: SourceType;
    intentLabel?: string;

    // DEPRECATED: Keep for backwards compatibility
    targetUserId?: string;
    acceptedUserId?: string;
    targetUser?: {
        name?: string;
        id?: string;
    };

    // NEW: Multiple target users support
    targetUserIds: string[];
    targetUsers?: Array<{
        name?: string;
        id?: string;
    }>;
    acceptedUserIds: string[];
    suggestionReason?: string;
    minParticipants: number;
    maxParticipants: number;

    title: string;
    broadcastMetadata?: BroadcastMetadata;
    backupScheduledTimes?: string[]; // Optional list of backup times for DRAFT meetings
}

export interface ProcessedMeetingType extends MeetingType {
    displayScheduledFor: string;
    acceptedUser?: {
        name?: string;
        id?: string;
    };
    acceptedUsers?: Array<{
        name?: string;
        id?: string;
    }>;
    userFrom?: {
        name?: string;
        id?: string;
        phoneNumber?: string;
    };
    // DEPRECATED: Keep for backwards compatibility
    targetUser?: {
        name?: string;
        id?: string;
    };
    // NEW: Multiple target users support
    targetUsers?: Array<{
        name?: string;
        id?: string;
    }>;
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

