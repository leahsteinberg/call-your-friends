import { useGetMeetingsMutation } from "@/services/meetingApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
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

    useEffect(() => {
        async function handleGetMeetings() {
            const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
            const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
            setMeetings(processedMeetings);
        };  
        handleGetMeetings();
    }, [])

    const handleGetMeetings = async () =>  {
        const meetingsResult: { data: MeetingType[] } = await getMeetings({ userFromId: userId });
        const processedMeetings: ProcessedMeetingType[] = await processMeetings(meetingsResult.data);
        setMeetings(processedMeetings);
    };  

    return (
        <View style={[styles.container, {height: height*.3}]}>
            <View style={[styles.component, ]}>
                <Text>Set up phone calls, {userName}</Text>
            </View>
            {showMeetingCreator && 
                <View style={[styles.component,]}>
                        <MeetingCreator
                            refreshMeetings={handleGetMeetings}
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

