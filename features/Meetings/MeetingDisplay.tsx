import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { RootState } from "@/types";
import { Check, Radar, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import type { MeetingDisplayProps, MeetingState } from "./types";

export default function MeetingDisplay({ meeting }: MeetingDisplayProps) {
  const userId: string = useSelector((state: RootState) => state.auth.user.id)

  const meetingState: MeetingState = meeting.item.meetingState;

  const selfCreatedMeeting = meeting.item.userFromId === userId;

  const iconSize: number = 24;
  
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
        <Text style={styles.nameText}>with: {name}</Text>
      );
    } else {
      const name = meeting.item.userFrom?.name;
      if (!name) {
        return
      }
      return (
        <Text style={styles.nameText}>meeting created by: {name}</Text>
      );
    }
  };

  return (<View style={styles.container} key={meeting.index}>
            <Text style={styles.timeText}>{meeting.item.displayScheduledFor}</Text>
            {renderMeetingFriend()}
            {renderStateIcon()}
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
  timeText: {
    color: BRIGHT_BLUE,
    fontWeight: 900,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,
    
  },
  nameText: {
    color: ORANGE,
    fontWeight: 900,
    flexGrow: 1,
    paddingVertical: 10,
    paddingLeft: 5,

  },
});