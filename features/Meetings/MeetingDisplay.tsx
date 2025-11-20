import { useDeleteMeetingMutation } from "@/services/meetingApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { RootState } from "@/types";
import { Check, Radar, Trash2, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteMeetingOptimistic } from "./meetingSlice";
import type { MeetingDisplayProps, MeetingState } from "./types";

export default function MeetingDisplay({ meeting, refreshMeetings }: MeetingDisplayProps) {
  const dispatch = useDispatch();
  const userId: string = useSelector((state: RootState) => state.auth.user.id)
  const [deleteMeeting] = useDeleteMeetingMutation();

  const meetingState: MeetingState = meeting.item.meetingState;

  const selfCreatedMeeting = meeting.item.userFromId === userId;

  const iconSize: number = 24;

  const handleDeleteMeeting = async () => {
    try {
      // Optimistic deletion: remove from Redux state immediately
      dispatch(deleteMeetingOptimistic(meeting.item.id));

      // Then call the API to delete on backend
      await deleteMeeting({
        meetingId: meeting.item.id,
        userId
      }).unwrap();

      // Refresh the meetings list to sync with backend
      if (refreshMeetings) {
        refreshMeetings();
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert('Failed to delete meeting. Please try again.');
      // On error, refresh to restore the meeting from backend
      if (refreshMeetings) {
        refreshMeetings();
      }
    }
  };
  
  const renderStateIcon = (): React.JSX.Element | null => {
    if (meetingState === 'SEARCHING') {
      return (<Radar style={styles.icon} color={ORANGE} size={iconSize}/>);
    } else if (meetingState === 'REJECTED') {
      return (<X style={styles.icon} color="red" size={iconSize}/>);
    } else if (meetingState === 'ACCEPTED') {
      return (<Check style={styles.icon} color={BRIGHT_GREEN} size={iconSize}/>);
    } else if (meetingState === 'PAST') {
      return (<X style={styles.icon} color="red" size={iconSize}/>);
    }
    return null;
  };

  const renderMeetingFriend = () => {
    if (selfCreatedMeeting) {
      const name = meeting.item.acceptedUser?.name;
      if (!name) {
        return
      }
      return (
        <Text style={styles.nameText} numberOfLines={2}>with: {name}</Text>
      );
    } else {
      const name = meeting.item.userFrom?.name;
      if (!name) {
        return
      }
      return (
        <Text style={styles.nameText} numberOfLines={2}>meeting created by: {name}</Text>
      );
    }
  };

  return (<View style={styles.container} key={meeting.index}>
            <Text style={styles.timeText} numberOfLines={2}>{meeting.item.displayScheduledFor}</Text>
            {/* <Text>{relativeDateStringInDays(meeting.item.scheduledFor)}</Text> */}
            {renderMeetingFriend()}
            {renderStateIcon()}
            <TouchableOpacity
              onPress={handleDeleteMeeting}
              style={styles.deleteButton}
            >
              <Trash2 color="red" size={20} />
            </TouchableOpacity>
        </View>
        );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    backgroundColor: CREAM,
    borderWidth: 2,
    borderColor: DARK_BEIGE,

  },
  icon: {
    paddingRight: 10,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  timeText: {
    color: BRIGHT_BLUE,
    fontWeight: 900,
    flexShrink: 1,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,

  },
  nameText: {
    color: ORANGE,
    fontWeight: 900,
    flexShrink: 1,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,

  },
});