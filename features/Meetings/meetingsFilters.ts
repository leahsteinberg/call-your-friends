import { ACCEPTED_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { IMMEDIATE_TIME_TYPE, ProcessedMeetingType } from "./types";

export const isActiveOpenBroadcastMeeting = (m: ProcessedMeetingType) => {
    const now = Date.now();
    return m.meetingState === SEARCHING_MEETING_STATE &&
        m.timeType === IMMEDIATE_TIME_TYPE &&
        new Date(m.scheduledEnd).getTime() > now ; 
};

export const isActiveClaimedSelfBroadcastMeeting = (userId: string) => {
    return (m: ProcessedMeetingType) => {
        const isSelfMeeting = m.userFromId === userId;
        const now = Date.now();
        const isClaimedBroadcast  = m.meetingState === ACCEPTED_MEETING_STATE &&
            m.timeType === IMMEDIATE_TIME_TYPE &&
            new Date(m.scheduledEnd).getTime() > now;

        return isClaimedBroadcast;
    }
};

export const isActiveOrSoonMeeting = () => {

};


