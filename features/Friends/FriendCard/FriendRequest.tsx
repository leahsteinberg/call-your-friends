import UserCard from "@/components/UserCard/UserCard";
import { CustomFonts } from "@/constants/theme";
import { useAcceptFriendRequestMutation, useRemoveInviteMutation } from "@/services/contactsApi";
import { BRIGHT_GREEN, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useSelector } from "react-redux";
import { FriendRequestProps } from "../types";

interface FriendRequestPropsExtended extends FriendRequestProps {
  onRemove?: (id: string) => void;
}

export default function FriendRequest({ item, onRemove }: FriendRequestPropsExtended): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [removeInvite] = useRemoveInviteMutation();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

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

  const handleDelete = async () => {
    const inviteId = item.id;
    setIsDeleted(true);
    onRemove?.(inviteId);

    try {
      await removeInvite({ inviteId }).unwrap();
    } catch (error) {
      console.error("Failed to remove friend request:", error);
      setIsDeleted(false);
    }
  };

  if (isDeleted) {
    return <></>;
  }

  return (
    <UserCard onSwipeDelete={handleDelete}>
      <UserCard.Avatar name={item.userFrom.name} avatarUrl={item.userFrom.avatarUrl} size={48} />

      <UserCard.Content>
        <UserCard.Title>{item.userFrom.name}</UserCard.Title>
        <UserCard.Subtitle>Friend Request</UserCard.Subtitle>
      </UserCard.Content>

      <UserCard.Actions>
        {!isAccepted ? (
          <UserCard.Button
            onPress={handleAccept}
            loading={isAccepting}
            variant="primary"
          >
            <Text style={styles.acceptText}>Accept</Text>
          </UserCard.Button>
        ) : (
          <Text style={styles.acceptedText}>Accepted</Text>
        )}
      </UserCard.Actions>
    </UserCard>
  );
}

const styles = StyleSheet.create({
  acceptText: {
    color: CREAM,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: CustomFonts.ztnaturebold,
  },
  acceptedText: {
    color: BRIGHT_GREEN,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: CustomFonts.ztnaturebold,
  },
});
