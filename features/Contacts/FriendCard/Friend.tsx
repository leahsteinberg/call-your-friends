import Avatar from "@/components/Avatar/Avatar";
import TalkSoonButton from "@/components/CardActionDecorations/TalkSoonButton";
import UserCard from "@/components/UserCard/UserCard";
import { CustomFonts } from "@/constants/theme";
import { useUserCalledMutation } from "@/services/contactsApi";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BURGUNDY, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_INTENT_SIGNAL_TYPE, CallIntentPayload } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import { FriendProps } from "../types";

export default function Friend({ item, onCallIntentChange }: FriendProps): React.JSX.Element {
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const isBroadcasting = item.isBroadcastingToMe;
  const [showCallIntentActions, setShowCallIntentActions] = useState(item.hasOutgoingCallIntent ?? false);
  const [addUserSignal, { isLoading: isCallingIntent }] = useAddUserSignalMutation();
  const [removeUserSignal, { isLoading: isUndoing }] = useRemoveUserSignalMutation();
  const [userCalled] = useUserCalledMutation();

  useEffect(() => {
    setShowCallIntentActions(item.hasOutgoingCallIntent ?? false);
  }, [item.hasOutgoingCallIntent]);

  const handleCallIntent = async () => {
    setShowCallIntentActions(true);
    try {
      const payload: CallIntentPayload = { targetUserId: item.id };
      await addUserSignal({
        userId,
        type: CALL_INTENT_SIGNAL_TYPE,
        payload
      }).unwrap();
      onCallIntentChange?.();
    } catch (error) {
      setShowCallIntentActions(false);
      console.error("Error setting call intent:", error);
      alert('Failed to set call intent. Please try again.');
    }
  };

  const handleNeverMind = async () => {
    setShowCallIntentActions(false);
    try {
      if (item.outgoingCallIntentSignalId) {
        await removeUserSignal({ userId, signalId: item.outgoingCallIntentSignalId }).unwrap();
      }
      onCallIntentChange?.();
    } catch (error) {
      setShowCallIntentActions(true);
      console.error("Error undoing call intent:", error);
      alert('Failed to undo call intent. Please try again.');
    }
  };

  const handleCalled = async () => {
    try {
      if (item.outgoingCallIntentSignalId) {
        await removeUserSignal({ userId, signalId: item.outgoingCallIntentSignalId }).unwrap();
      }
      await userCalled({ userId, userToId: item.id }).unwrap();
      onCallIntentChange?.();
    } catch (error) {
      console.error("Error marking as called:", error);
      alert('Failed to mark as called. Please try again.');
    }
  };

  const handleCallNow = () => {
    console.log(`Calling ${item.name} at ${item.phoneNumber}`);
  };

  // Green dot animation for broadcasting
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (isBroadcasting) {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, false
      );
    } else {
      dotScale.value = withTiming(1, { duration: 300 });
    }
  }, [isBroadcasting]);

  return (
    <UserCard>
      <UserCard.Avatar name={item.name} avatarUrl={item.avatarUrl} size={56}>
        <Avatar.PulseRing active={!!isBroadcasting} />
      </UserCard.Avatar>

      <UserCard.Content>
        <UserCard.Title>{item.name}</UserCard.Title>
        {item.hasIncomingCallIntent && (
          <UserCard.Subtitle color="#262626">They want to call you!</UserCard.Subtitle>
        )}
      </UserCard.Content>

      <UserCard.Actions>
        {isBroadcasting && (
          <TouchableOpacity onPress={handleCallNow} style={styles.callNowButton}>
            <Text style={styles.callNowText}>Call Now</Text>
          </TouchableOpacity>
        )}
        <TalkSoonButton
          isActive={showCallIntentActions}
          onPress={handleCallIntent}
          onNeverMind={handleNeverMind}
          isLoading={isCallingIntent || isUndoing}
        />
      </UserCard.Actions>
    </UserCard>
  );
}

const styles = StyleSheet.create({
  callNowButton: {
    backgroundColor: BURGUNDY,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  callNowText: {
    color: PALE_BLUE,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: CustomFonts.ztnaturebold,
  },
});
