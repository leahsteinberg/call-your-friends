import { useGetMeetingsQuery } from "@/services/meetingApi";
import { CANCELED_MEETING_STATE, DRAFT_MEETING_STATE, PAST_MEETING_STATE, SEARCHING_MEETING_STATE } from "@/types/meetings-offers";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMeetings } from "../features/Meetings/meetingSlice";
import { processMeetings } from "../features/Meetings/meetingsUtils";
import { ProcessedMeetingType } from "../features/Meetings/types";

/**
 * Custom hook that fetches, processes, and manages meetings data
 * @returns Object containing processed meetings, loading state, and refetch function
 */
export function useProcessedMeetings() {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const {
        data: rawMeetings = [],
        isLoading,
        refetch
    } = useGetMeetingsQuery({ userFromId: userId });

    const [processedMeetings, setProcessedMeetings] = useState<ProcessedMeetingType[]>([]);

    // Process meetings when raw data changes
    useEffect(() => {
        const processAsync = async () => {
            // Update Redux store with raw meetings
            dispatch(setMeetings(rawMeetings));
            if (rawMeetings && rawMeetings.length > 0) {
                const now = Date.now();
                const filteredMeetings = rawMeetings.filter(m => {
                    if (m.meetingState === CANCELED_MEETING_STATE || m.meetingState === PAST_MEETING_STATE) return false;
                    if (m.meetingState === SEARCHING_MEETING_STATE && new Date(m.scheduledEnd).getTime() < now) return false;
                    if (m.meetingState === DRAFT_MEETING_STATE && new Date(m.scheduledEnd).getTime() < now) return false;
                    return true;
                });
                const processed = await processMeetings(filteredMeetings);

                console.log("processed ---", processed);
                setProcessedMeetings(processed);
            } else {
                setProcessedMeetings([]);
            }
        };

        if (!isLoading) {
            processAsync();
        }
    }, [rawMeetings, isLoading, dispatch]);

    return {
        meetings: processedMeetings,
        isLoading,
        refetch
    };
}
