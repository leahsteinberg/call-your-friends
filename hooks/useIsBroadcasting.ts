import { isActiveOpenBroadcastMeeting } from "@/features/Meetings/meetingsFilters";
import { useProcessedMeetings } from './useProcessedMeetings';


export function useIsBroadcasting() {
    const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useProcessedMeetings();

    const broadcastMeetings = meetings.filter(isActiveOpenBroadcastMeeting);
    const isBroadcasting = broadcastMeetings.length > 0;
    console.log("is Broadcasting??", isBroadcasting);
    return isBroadcasting
};
