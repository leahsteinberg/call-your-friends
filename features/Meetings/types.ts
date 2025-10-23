import { BaseEntity } from "@/types/common";

export interface MeetingType extends BaseEntity {
    meetingState: 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST';
    title: string;
    displayScheduledFor: string;
    scheduledFor: string;
    scheduledEnd: string;
    userFromId: string;
}

export interface ProcessedMeetingType extends MeetingType {
    displayScheduledFor: string;
}

export interface MeetingsListProps {
    meetings: ProcessedMeetingType[];
}

export interface OfferType extends BaseEntity {
    meetingId: string;
    offerState: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

