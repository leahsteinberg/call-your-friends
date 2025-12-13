import { CustomFonts } from "@/constants/theme";
import { BRIGHT_BLUE, ORANGE, PALE_BLUE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {

  return (
    <View style={styles.container} key={contact.index}>
      <View style={styles.header}>
        <Text style={styles.mainText}>Waiting for friend</Text>
      </View>
      <Text style={styles.subtitle}>Invited {displayTimeDifference(contact.item.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALE_BLUE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  header: {
    marginBottom: 4,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '600',
    color: ORANGE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  subtitle: {
    fontSize: 14,
    color: BRIGHT_BLUE,
    fontFamily: CustomFonts.ztnatureregular,
  },
})