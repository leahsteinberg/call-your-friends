import { useGetMeetingsMutation } from "@/services/meetingApi";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import MeetingCreator from "./MeetingCreator";
import MeetingsList from "./MeetingsList";

export default function Meetings() {
    const userId = useSelector((state) => state.auth.user.id);
    const [meetings, setMeetings] = useState([]);
    const [getMeetings] = useGetMeetingsMutation();

    useEffect(()=> {
        handleGetMeetings()
    }, [])

    const handleGetMeetings = async () => {
        const meetingsResult = await getMeetings({userFromId: userId})
        console.log("Meetings result - ", meetingsResult)
        setMeetings(meetingsResult.data);
        // const friendsResult = await getFriends({id: userFromId});
        // setFriends(friendsResult.data);
    }

    const sampleMeetings = [{
            scheduledTime: 'this is the scheduled Time'
    }];

    return (
        <View>
            <MeetingCreator/>
            <MeetingsList
                meetings={meetings}
            />
        </View>
    )
}