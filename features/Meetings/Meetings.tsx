import { useGetMeetingsMutation } from "@/services/meetingApi";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";
import { processMeetings } from "./meetingsUtils";

export default function Meetings() {
    const userId = useSelector((state) => state.auth.user.id);
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
        <View>
            <MeetingCreator/>
            <MeetingsList
                meetings={meetings}
            />
        </View>
    )
}