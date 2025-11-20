import { useProcessedMeetings } from "@/hooks/useProcessedMeetings";
import { useProcessedOffers } from "@/hooks/useProcessedOffers";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";


export default function Meetings() {
    const [showMeetingCreator, setShowMeetingCreator] = useState<Boolean>(true);
    const [refreshing, setRefreshing] = useState(false);
    const [forceReprocess, setForceReprocess] = useState(0);

    // Use custom hooks for data fetching and processing
    const { meetings, refetch: refetchMeetings } = useProcessedMeetings();
    const { offers, refetch: refetchOffers } = useProcessedOffers(forceReprocess);

    // Manual refresh via pull-to-refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchMeetings(), refetchOffers()]);
        // Force reprocessing to update time-based fields like displayExpiresAt
        setForceReprocess(prev => prev + 1);
        setRefreshing(false);
    };

 
    return (
        <View style={[styles.container,]}>
            <View style={styles.listComponent}>
                <MeetingsList
                    meetings={meetings}
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
