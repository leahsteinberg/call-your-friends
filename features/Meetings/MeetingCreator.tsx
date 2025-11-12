import { useCreateMeetingMutation } from "@/services/meetingApi";
import { CREAM, DARK_GREEN, LIGHT_BEIGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";
import UnifiedDateTimePicker from "./UnifiedDateTimePicker";
import { displayDateTime } from "./meetingsUtils";

export default function MeetingCreator({refreshMeetings}: {refreshMeetings: () => void}) {
    const { height, width } = useWindowDimensions();
    const [createMeeting] = useCreateMeetingMutation();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [displayDateString, setDisplayDateString] = useState('');

    const handleDateTimeSelect = async (dateTime: Date) => {
        setSelectedDateTime(dateTime);
        const displayString = await displayDateTime(dateTime.toISOString());
        setDisplayDateString(displayString);
    };

    const handleCreateMeeting = () => {
        if (!selectedDateTime) {
            alert('Please select a date and time first');
            return;
        }

        const scheduledFor = selectedDateTime.toISOString();
        const scheduledEnd = new Date(selectedDateTime);
        scheduledEnd.setHours(scheduledEnd.getHours() + 1);
        
        createMeeting({
            userFromId: userId,
            scheduledFor,
            scheduledEnd: scheduledEnd.toISOString(),
        });
        refreshMeetings();
    };
    
    return (
        <View style={[styles.container]}>
            <Text style={styles.title}>When are you free to chat?</Text>
            <UnifiedDateTimePicker 
                onDateTimeSelect={handleDateTimeSelect}
                selectedDateTime={selectedDateTime || undefined}
            />
            
            <TouchableOpacity 
                style={[styles.createButton, !selectedDateTime && styles.disabledButton]}
                onPress={handleCreateMeeting}
                disabled={!selectedDateTime}
            >
                <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText]}>
                    Find a friend to talk on:
                </Text>
                <Text style={[styles.buttonText, !selectedDateTime && styles.disabledButtonText, ]}>
                    {displayDateString && `${displayDateString}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: LIGHT_BEIGE,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 15,
        shadowColor: PALE_BLUE,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: DARK_GREEN,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: DARK_GREEN,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    buttonText: {
        color: CREAM,
        fontSize: 20,
        fontWeight: '500',
    },
    disabledButtonText: {
        color: '#666',
    },
});


