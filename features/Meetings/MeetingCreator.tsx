import { useCreateMeetingMutation } from "@/services/meetingApi";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import MeetingTimePicker from "./WebMeetingTimePicker";
import { displayDateTime } from "./meetingsUtils";

export default function MeetingCreator({refreshMeetings}) {

    const [createMeeting] = useCreateMeetingMutation();
    const userId = useSelector((state) => state.auth.user.id);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDateString, setDisplayDateString] = useState('');

    const selectDateTime = async (moment) => {
        const dateString = moment.toDate().toISOString();
        setSelectedDate(dateString)
        const displayString = await displayDateTime(dateString)
        setDisplayDateString(displayString)
    }

    const handleCreateMeeting = () => {
        const dateObj = new Date(selectedDate)
        dateObj.setHours(dateObj.getHours() + 1)
        const scheduledEnd = dateObj.toISOString();
        createMeeting({
            userFromId: userId,
            scheduledFor: selectedDate,
            scheduledEnd,
        })
        refreshMeetings()
    }
    
    return (
        <View>
            <TouchableOpacity onPress={handleCreateMeeting}>
                <Text>Make a Meeting at {displayDateString}</Text>
            </TouchableOpacity>
                <MeetingTimePicker selectDateTime={selectDateTime}/>
        </View>
    )
}






