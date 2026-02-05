import { CustomFonts } from "@/constants/theme";
import { useAcceptFriendRequestMutation, useRemoveInviteMutation } from "@/services/contactsApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CHOCOLATE_COLOR, ORANGE, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { Trash2 } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { FriendRequestProps } from "./types";

interface FriendRequestPropsExtended extends FriendRequestProps {
  onRemove?: (id: string) => void;
}

export default function FriendRequest({ item, onRemove }: FriendRequestPropsExtended): React.JSX.Element {
  console.log("friend request ---", item)
  const userId = useSelector((state: RootState) => state.auth.user.id);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [removeInvite] = useRemoveInviteMutation();
  const swipeableRef = useRef<Swipeable>(null);

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

    // Optimistic deletion - hide from UI immediately
    setIsDeleted(true);
    onRemove?.(inviteId);

    try {
      await removeInvite({ inviteId }).unwrap();
    } catch (error) {
      console.error("Failed to remove friend request:", error);
      setIsDeleted(false);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.deleteIconContainer, { transform: [{ scale }] }]}>
          <Trash2 size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const onSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      handleDelete();
    }
  };

  if (isDeleted) {
    return <></>;
  }

  return (
    <View style={styles.swipeableWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
        rightThreshold={80}
        overshootRight={false}
      >
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
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
    swipeableWrapper: {
      marginHorizontal: 10,
      marginBottom: 8,
    },
    container: {
      backgroundColor: PALE_BLUE,
      borderRadius: 8,
      padding: 12,
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
    deleteAction: {
      backgroundColor: '#DC3545',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    deleteIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
});
