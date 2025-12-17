import { useGetMeetingsQuery } from "@/services/meetingApi";
import { CANCELED_MEETING_STATE } from "@/types/meetings-offers";
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
                console.log("rawMeetings", rawMeetings);
                const rawMeetingsWithoutCancelled = rawMeetings.filter(m => m.meetingState !== CANCELED_MEETING_STATE)
                console.log("raw w o canceld", rawMeetingsWithoutCancelled)
                const processed = await processMeetings(rawMeetingsWithoutCancelled);
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
