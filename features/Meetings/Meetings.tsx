import { useGetMeetingsQuery } from "@/services/meetingApi";
import { useGetOffersQuery } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ProcessedOfferType } from "../Offers/types";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { setMeetings } from "./meetingSlice";
import { processMeetings, processOffers } from "./meetingsUtils";
import { ProcessedMeetingType } from "./types";


export default function Meetings() {
    const dispatch = useDispatch();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    // Query hooks auto-fetch and auto-refetch when tags are invalidated
    const {
        data: rawMeetings = [],
        isLoading: meetingsLoading,
        refetch: refetchMeetings
    } = useGetMeetingsQuery({ userFromId: userId });

    const {
        data: rawOffers = [],
        isLoading: offersLoading,
        refetch: refetchOffers
    } = useGetOffersQuery({ userId });

    const [showMeetingCreator, setShowMeetingCreator] = useState<Boolean>(true);
    const [offers, setOffers] = useState<ProcessedOfferType[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [processedMeetings, setProcessedMeetings] = useState<ProcessedMeetingType[]>([]);

    // Store raw meetings in Redux and process them when data changes
    useEffect(() => {
        const processAsync = async () => {
            // Update Redux store with raw meetings
            dispatch(setMeetings(rawMeetings));

            if (rawMeetings && rawMeetings.length > 0) {
                const processed = await processMeetings(rawMeetings);
                setProcessedMeetings(processed);
            } else {
                setProcessedMeetings([]);
            }
        };

        if (!meetingsLoading) {
            processAsync();
        }
    }, [rawMeetings, meetingsLoading, dispatch]);

    // Process offers when data changes
    useEffect(() => {
        const processAsync = async () => {
            if (rawOffers && rawOffers.length > 0) {
                const processed = await processOffers(rawOffers);
                setOffers(processed);
            } else {
                setOffers([]);
            }
        };

        if (!offersLoading) {
            processAsync();
        }
    }, [rawOffers, offersLoading]);

    // Manual refresh via pull-to-refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchMeetings(), refetchOffers()]);
        setRefreshing(false);
    };

 
    return (
        <View style={[styles.container,]}>
            <View style={styles.listComponent}>
                <MeetingsList
                    meetings={processedMeetings}
                    offers={offers}
                    refresh={handleRefresh}
                    refreshing={refreshing}
                />
            </View>
            {showMeetingCreator &&
                <View style={styles.creatorComponent}>
                        {/* No need to pass refreshMeetings - cache tags auto-refetch */}
                        <MeetingCreator />
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,

        maxHeight: '100%',
        maxWidth: '100%',
        width: '100%',
        
        justifyContent: 'space-between',
        overflow: 'scroll',
        flex: 1,

    },
    creatorComponent: {
       flexShrink: 0,
       marginBottom: 15
    
    },
    listComponent: {
        flex: 1,
        margin: 10,
    }
});
