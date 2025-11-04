import { useGetMeetingsMutation } from "@/services/meetingApi";
import { useGetOffersMutation } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { processMeetings } from "./meetingsUtils";
import { MeetingType, ProcessedMeetingType } from "./types";


export default function Meetings() {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string = useSelector((state: RootState) => state.auth.user.email)
    
    const [meetings, setMeetings] = useState<ProcessedMeetingType[]>([]);
    const [getMeetings] = useGetMeetingsMutation();
    const [showMeetingCreator, setShowMeetingCreator] = useState<Boolean>(true);
    const [needGetMeetings, setNeedGetMeetings] = useState<Boolean>(false);
    const [getOffers] = useGetOffersMutation();
    const [offers, setOffers] = useState([])

    const fetchProcessMeetings = async () =>  {
        const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
        const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
        setMeetings(processedMeetings);
    }; 


    useEffect(() => {
        async function handleGetOffers() {
            const offersResponse = await getOffers({ userId });
            setOffers(offersResponse.data);
        }
        handleGetOffers();
    }, []);

    useEffect(() => {
        async function handleGetMeetings() {
            fetchProcessMeetings();
        };  
        handleGetMeetings();
    }, []);

 
    return (
        <View style={[styles.container,]}>
            {showMeetingCreator && 
                <View style={[styles.component,]}>
                        <MeetingCreator
                            refreshMeetings={fetchProcessMeetings}
                        />
                </View>
            }
            <View style={styles.listComponent}>
                <MeetingsList
                    meetings={meetings}
                    offers={offers}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        justifyContent: 'space-between',
        overflow: 'scroll',
        maxHeight: '100%',
        maxWidth: '100%',
        minWidth: 300,
        width: '100%',
        flex: 1,
    },

    listComponent: {
        overflow: 'scroll',
        flex: 'auto',
        flexGrow: 1,
        maxHeight: '100%',

    }
});

