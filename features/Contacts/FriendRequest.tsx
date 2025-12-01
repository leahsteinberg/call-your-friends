import { useAcceptFriendRequestMutation } from "@/services/contactsApi";
import { BRIGHT_GREEN, BURGUNDY, CREAM, ORANGE, PEACH } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import PhoneNumberDisplay from "../Common/PhoneNumberDisplay";
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
    <View style={[styles.container, isAccepted && styles.acceptedContainer]} key={item.index}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.userFrom.name}</Text>
        <PhoneNumberDisplay digits={item.userFrom.phoneNumber}/>
      </View>

      {!isAccepted ? (
        <TouchableOpacity
          onPress={handleAccept}
          style={styles.acceptButton}
          disabled={isAccepting}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color={BRIGHT_GREEN} />
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
  );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: PEACH,
      borderWidth: 2,
      borderColor: ORANGE,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 3,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 10,
      borderRadius: 15,
      flex: 1,
    },
    acceptedContainer: {
      backgroundColor: CREAM,
      borderColor: BRIGHT_GREEN,
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    name: {
      color: BURGUNDY,
      fontWeight: 900,
      flexGrow: 1,
      paddingVertical: 10,
      borderRadius: 18,
      paddingLeft: 5,
    },
    acceptButton: {
      backgroundColor: BRIGHT_GREEN,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptButtonText: {
      color: CREAM,
      fontSize: 14,
      fontWeight: '600',
    },
    acceptedLabel: {
      backgroundColor: BRIGHT_GREEN,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    acceptedText: {
      color: CREAM,
      fontSize: 14,
      fontWeight: '600',
    },
});
