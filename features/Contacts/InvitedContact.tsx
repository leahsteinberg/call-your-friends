import { CustomFonts } from "@/constants/theme";
import { useRemoveInviteMutation } from "@/services/contactsApi";
import { BOLD_BLUE, BRIGHT_BLUE, PALE_BLUE } from "@/styles/styles";
import { Trash2 } from "lucide-react-native";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { displayTimeDifference } from "../Meetings/meetingsUtils";
import { removeSentInvite } from "./contactsSlice";
import { InvitedContactProps } from "./types";

export default function InvitedContact({ contact }: InvitedContactProps): React.JSX.Element {
  const dispatch = useDispatch();
  const [removeInvite] = useRemoveInviteMutation();
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = async () => {
    const inviteId = contact.item.id;

    // Optimistic deletion - remove from UI immediately
    dispatch(removeSentInvite(inviteId));

    try {
      await removeInvite({ inviteId }).unwrap();
    } catch (error) {
      console.error("Failed to remove invite:", error);
      // Note: In a production app, you might want to restore the item on failure
      // and show an error message to the user
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

  return (
    <View style={styles.swipeableWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
        rightThreshold={80}
        overshootRight={false}
      >
        <View style={styles.container} key={contact.index}>
          <View style={styles.header}>
            <Text style={styles.mainText}>Waiting for friend ({contact.item.userToPhoneNumber})</Text>
          </View>
          <Text style={styles.subtitle}>Invited {displayTimeDifference(contact.item.createdAt)}</Text>
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
    marginBottom: 4,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '600',
    color: BOLD_BLUE,
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
