import { useGetOffersQuery } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { processOffers } from "../features/Meetings/meetingsUtils";
import { ProcessedOfferType } from "../features/Offers/types";

/**
 * Custom hook that fetches, processes, and manages offers data
 * @param forceReprocess - Counter to trigger reprocessing (e.g., for updating time-based fields)
 * @returns Object containing processed offers, loading state, and refetch function
 */
export function useProcessedOffers(forceReprocess = 0) {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const {
        data: rawOffers = [],
        isLoading,
        refetch
    } = useGetOffersQuery({ userId });

    const [processedOffers, setProcessedOffers] = useState<ProcessedOfferType[]>([]);

    // Process offers when raw data changes or when forced to reprocess
    useEffect(() => {
        const processAsync = async () => {
            if (rawOffers && rawOffers.length > 0) {
                const processed = await processOffers(rawOffers);
                setProcessedOffers(processed);
            } else {
                setProcessedOffers([]);
            }
        };

        if (!isLoading) {
            processAsync();
        }
    }, [rawOffers, isLoading, forceReprocess]);

    return {
        offers: processedOffers,
        isLoading,
        refetch
    };
}
