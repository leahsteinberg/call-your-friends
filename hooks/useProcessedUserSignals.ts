import { useGetSignalsQuery } from "@/services/userSignalsApi";
import { RootState } from "@/types/redux";
import { SignalType, UserSignal } from "@/types/userSignalsTypes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProcessedUserSignals() {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const {
        data: rawUserSignals = [],
        isLoading,
        refetch
    } = useGetSignalsQuery({userId});

    const [processedUserSignals, setProcessedUserSignals] = useState<UserSignal<SignalType>[]>([]);

    // Process meetings when raw data changes
    useEffect(() => {
        // const processAsync = async () => {
        //     // Update Redux store with raw meetings
        //     dispatch(setMeetings(rawMeetings));

        //     if (rawMeetings && rawMeetings.length > 0) {
        //         const rawMeetingsWithoutCancelled = rawMeetings.filter(m => m.meetingState !== CANCELED_MEETING_STATE)
        //         const processed = await processMeetings(rawMeetingsWithoutCancelled);
        //         setProcessedMeetings(processed);
        //     } else {
        //         setProcessedMeetings([]);
        //     }
        // };

        // if (!isLoading) {
        //     processAsync();
        // }
    }, [rawUserSignals, isLoading, dispatch]);

    return {
        userSignals: processedUserSignals,
        isLoading,
        refetch
    };
}
