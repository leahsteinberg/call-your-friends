import { useGetMeetingsMutation } from "@/services/meetingApi";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { processMeetings } from "./meetingsUtils";
import Offers from "./Offers";

export default function Meetings() {
    const userId = useSelector((state) => state.auth.user.id);
    const {height, width} = useWindowDimensions();
    
    
    const [meetings, setMeetings] = useState([]);
    const [getMeetings] = useGetMeetingsMutation();    

    useEffect(()=> {
        handleGetMeetings()
    }, [])

    const handleGetMeetings = async () => {
        const meetingsResult = await getMeetings({userFromId: userId})
        const processedMeetings = await processMeetings(meetingsResult.data);
        setMeetings(processedMeetings);
    }

    return (
        <View style={[styles.container, {height: height*.3, width: width*.9}]}>
            <View>
                <Text>Set up phone calls</Text>
            </View>
            <View style={styles.component}>
                <MeetingCreator
                    refreshMeetings={handleGetMeetings}
                />
            </View>
            <View style={styles.component}>
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
        minHeight: 500,
        backgroundColor: 'lightgreen',
        alignContent: 'center',
        justifyContent: 'space-around',
    },
    component: {
        backgroundColor: 'red',
        // flex: 1,
        // borderColor: 'green',
        // borderWidth: 1,
        // margin: 10,
        // padding: 15,
    },
});