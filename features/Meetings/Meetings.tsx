import { useGetMeetingsMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import Offers from "../Offers/Offers";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { processMeetings } from "./meetingsUtils";
import { MeetingType, ProcessedMeetingType } from "./types";

export default function Meetings() {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const userName: string = useSelector((state: RootState) => state.auth.user.email)
    const { height, width } = useWindowDimensions();
    
    const [meetings, setMeetings] = useState<ProcessedMeetingType[]>([]);
    const [getMeetings] = useGetMeetingsMutation();
    const [showMeetingCreator, setShowMeetingCreator] = useState<Boolean>(true);
    const [needGetMeetings, setNeedGetMeetings] = useState<Boolean>(false);

    const fetchProcessMeetings = async () =>  {
        const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
        const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
        setMeetings(processedMeetings);
    };  

    useEffect(() => {
        async function handleGetMeetings() {
            fetchProcessMeetings();
        };  
        handleGetMeetings();
    }, []);

 
    return (
        <View style={[styles.container, {height: height*.3}]}>
            {showMeetingCreator && 
                <View style={[styles.component,]}>
                        <MeetingCreator
                            refreshMeetings={fetchProcessMeetings}
                        />
                </View>
            }
            <View style={[styles.component, ]}>
                <MeetingsList
                    meetings={meetings}
                />
            </View>
            <View style={styles.component}>
                <Offers/>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        backgroundColor: 'lightgreen',
        //alignContent: 'center',
        justifyContent: 'space-between',
        overflow: 'scroll'
    },
    component: {
        maxHeight: '100%',
        // borderColor: 'green',
        // borderWidth: 1,
        // margin: 10,
        // padding: 15,
    },
});

