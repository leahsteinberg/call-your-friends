import { SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { IMMEDIATE_TIME_TYPE, ProcessedMeetingType } from "./types";

export const isActiveOpenBroadcastMeeting = (m: ProcessedMeetingType) => {
    const now = Date.now();
    return m.meetingState === SEARCHING_MEETING_STATE &&
        m.timeType === IMMEDIATE_TIME_TYPE &&
        new Date(m.scheduledEnd).getTime() > now ; 
};

export const isActiveOrSoonMeeting = () => {

};


