import { useGetMeetingsMutation } from "@/services/meetingApi";
import { useGetOffersMutation } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { processMeetings, processOffers } from "./meetingsUtils";
import { MeetingType, ProcessedMeetingType } from "./types";


export default function Meetings() {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string = useSelector((state: RootState) => state.auth.user.name)
    
    const [meetings, setMeetings] = useState<ProcessedMeetingType[]>([]);
    const [getMeetings] = useGetMeetingsMutation();
    const [showMeetingCreator, setShowMeetingCreator] = useState<Boolean>(true);
    const [needGetMeetings, setNeedGetMeetings] = useState<Boolean>(false);
    const [getOffers] = useGetOffersMutation();
    const [offers, setOffers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);



    const fetchProcessMeetings = async () =>  {
        console.log("fetch and process meetings")
        const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
        const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
        setMeetings(processedMeetings);
    }; 
    const fetchOffers = async () => {
        const offersResponse = await getOffers({ userId });
        console.log("offers response", offersResponse)
        const processedOffers: ProcessedOfferType[] = await processOffers(offersResponse.data);
        console.log("Procesesd offers", processedOffers)
        setOffers(processedOffers);
    };

    useEffect(() => {
        async function handleGetOffers() {
            fetchOffers();
        }
        handleGetOffers();
    }, []);

    useEffect(() => {
        async function handleGetMeetings() {
            fetchProcessMeetings();
        };  
        handleGetMeetings();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Your data fetching or update logic here
        await fetchProcessMeetings(); // Example: function to fetch new data
        setRefreshing(false);
    };

 
    return (
        <View style={[styles.container,]}>
            <Text>{userName} {userId}</Text>
            {showMeetingCreator && 
                <View style={styles.creatorComponent}>
                        <MeetingCreator
                            refreshMeetings={fetchProcessMeetings}
                        />
                </View>
            }
            <View style={styles.listComponent}>
                <MeetingsList
                    meetings={meetings}
                    offers={offers}
                    refresh={handleRefresh}
                    refreshing={refreshing}
                />
            </View>
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
    
    },
    listComponent: {
        flex: 1,
        margin: 10,
    }
});
