import { CustomFonts } from "@/constants/theme";
import { useAcceptFriendRequestMutation } from "@/services/contactsApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, CREAM, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { FriendRequestProps } from "./types";

export default function FriendRequest({ item }: FriendRequestProps): React.JSX.Element {
  console.log("friend request ---", item)
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await acceptFriendRequest({ userId, friendRequestId: item.id, token: item.token }).unwrap();
      setIsAccepted(true);
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert('Failed to accept friend request. Please try again.');
      setIsAccepting(false);
    }
  };

  return (
    <View style={styles.container} key={item.index}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.userFrom.name}</Text>
        <View style={styles.buttonContainer}>
          {!isAccepted ? (
            <TouchableOpacity
              onPress={handleAccept}
              style={styles.acceptButton}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color={CHOCOLATE_COLOR} />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.acceptedLabel}>
              <Text style={styles.acceptedText}>Accepted</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.subtitle}>Friend Request</Text>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 20,
      fontWeight: '600',
      color: ORANGE,
      fontFamily: CustomFonts.ztnaturebold,
      flexShrink: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    acceptButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    acceptButtonText: {
      color: CHOCOLATE_COLOR,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: CustomFonts.ztnaturebold,
    },
    acceptedLabel: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    acceptedText: {
      color: BRIGHT_GREEN,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: CustomFonts.ztnaturebold,
    },
    subtitle: {
      fontSize: 14,
      color: BRIGHT_BLUE,
      fontFamily: CustomFonts.ztnatureregular,
    },
});
