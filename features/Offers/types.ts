import { OfferState } from "@/types/meetings-offers";
import { BroadcastMetadata, MeetingEvent, MeetingType } from "../Meetings/types";

// Offer type is now determined by the meeting it references
export interface OfferType extends MeetingEvent {
    meetingId: string;
    offerState: OfferState;
    // offerType removed - use meeting.timeType and meeting.targetType instead
}

export interface ProcessedOfferType extends OfferType {
    userFromName: string;
    displayScheduledFor: string;
    displayExpiresAt: string;
    meeting?: MeetingType & {
        userFrom?: {
            name?: string;
            id?: string;
            avatarUrl?: string;
        };
        // DEPRECATED: Keep for backwards compatibility
        targetUser?: {
            name?: string;
            id?: string;
            avatarUrl?: string;
        };
        // NEW: Multiple target users support
        targetUsers?: Array<{
            name?: string;
            id?: string;
            avatarUrl?: string;
        }>;
        broadcastMetadata?: BroadcastMetadata;
    };
}
