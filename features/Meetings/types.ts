import { BaseEntity } from "@/types/common";


export interface MeetingEvent extends BaseEntity {
    displayScheduledFor: string;
    scheduledFor: string;
    scheduledEnd: string;
    userFromId: string;
}

export interface MeetingType extends MeetingEvent {
    meetingState: 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST';
    title: string;
}

export interface ProcessedMeetingType extends MeetingType {
    displayScheduledFor: string;
}

export interface MeetingsListProps {
    meetings: ProcessedMeetingType[];
}

export interface MeetingDisplayProps {
    meeting: {
        item: ProcessedMeetingType;
        index: number;
    };
    refreshMeetings?: () => void;
}

export type MeetingState = 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST';

