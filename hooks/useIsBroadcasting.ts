import { IMMEDIATE_TIME_TYPE } from "@/features/Meetings/types";
import { useEffect } from "react";
import { SEARCHING_MEETING_STATE } from '../types/meetings-offers';
import { useProcessedMeetings } from './useProcessedMeetings';


export function useIsBroadcasting() {
    const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useProcessedMeetings();
    useEffect(() => {
        
    }, []);

    const now = Date.now();

    const broadcastMeetings = meetings.filter((m) => 
        m.meetingState === SEARCHING_MEETING_STATE &&
        m.timeType === IMMEDIATE_TIME_TYPE &&
        new Date(m.scheduledEnd).getTime() > now  
    );
    const isBroadcasting = broadcastMeetings.length > 0;
    console.log("is Broadcasting??", isBroadcasting);
    return isBroadcasting
};
