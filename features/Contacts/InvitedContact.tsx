import UserCard from "@/components/UserCard/UserCard";
import { useRemoveInviteMutation } from "@/services/contactsApi";
import React from "react";
import { useDispatch } from "react-redux";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import { removeSentInvite } from "./contactsSlice";
import { formatPhoneNumber } from "./contactsUtils";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {
  const dispatch = useDispatch();
  const [removeInvite] = useRemoveInviteMutation();

  const handleDelete = async () => {
    const inviteId = contact.item.id;
    dispatch(removeSentInvite(inviteId));

    try {
      await removeInvite({ inviteId }).unwrap();
    } catch (error) {
      console.error("Failed to remove invite:", error);
    }
  };

  return (
    <UserCard onSwipeDelete={handleDelete}>
      {/* <UserCard.Avatar name={contact.item.userToPhoneNumber} size={44} /> */}

      <UserCard.Content>
        <UserCard.Title>Waiting for friend: {formatPhoneNumber(contact.item.userToPhoneNumber)}</UserCard.Title>
        <UserCard.Subtitle>Invited {displayTimeDifference(contact.item.createdAt)}</UserCard.Subtitle>
      </UserCard.Content>
    </UserCard>
  );
}
