import { isActiveClaimedSelfBroadcastMeeting, isActiveOpenBroadcastMeeting } from "@/features/Meetings/meetingsFilters";
import { useProcessedMeetings } from './useProcessedMeetings';


export function useIsBroadcasting() {
    const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useProcessedMeetings();
    const broadcastMeetings = meetings.filter(isActiveOpenBroadcastMeeting);
    const isBroadcasting = broadcastMeetings.length > 0;
    return isBroadcasting;
};

export function useIsClaimedBroadcasting(userId: string) {
    const { meetings, isLoading: meetingsLoading, refetch: refetchMeetings } = useProcessedMeetings();
    const filterClaimedBroadcast = isActiveClaimedSelfBroadcastMeeting(userId);
    const claimedBroadcastMeetings = meetings.filter(filterClaimedBroadcast);
    
    return claimedBroadcastMeetings.length > 0;
}
