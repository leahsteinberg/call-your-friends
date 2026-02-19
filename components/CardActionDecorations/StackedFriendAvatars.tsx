import { CustomFonts } from "@/constants/theme";
import { AVATAR_STACK_SIZE } from "@/constants/ui_constants";
import type { Friend } from "@/features/Friends/types";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import AvatarStackItem from "../Avatar/AvatarStackItem";
import StackExtraBadge from "./StackExtraBadge";

interface StackedFriendAvatarsProps {
  selectedFriends: Friend[];
  expanded?: boolean;
}

const MAX_VISIBLE_AVATARS = 4;


export default function StackedFriendAvatars({
  selectedFriends,
  expanded = false,
}: StackedFriendAvatarsProps): React.JSX.Element | null {
  // Don't show anything if no friends are selected
  if (!selectedFriends || selectedFriends.length === 0) {
    return null;
  }

  // Get the friends to display (max 4)
  const displayFriends = selectedFriends.slice(0, MAX_VISIBLE_AVATARS);

  // Calculate how many extra friends there are
  const extraCount = selectedFriends.length - MAX_VISIBLE_AVATARS;

  // Calculate overlap offset for collapsed state (70% overlap = show 30% of avatar width)
  const OVERLAP_OFFSET = -(AVATAR_STACK_SIZE * 0.7); // -28px for 40px avatars
  const EXPANDED_SPACING = 8;

  // Animation values
  const avatarSpacing = useSharedValue(expanded ? EXPANDED_SPACING : OVERLAP_OFFSET);
  const nameOpacity = useSharedValue(expanded ? 1 : 0);
  const nameHeight = useSharedValue(expanded ? 20 : 0);

  // Trigger animation when expanded state changes
  useEffect(() => {
    const duration = 300;
    const easing = Easing.out(Easing.cubic);

    if (expanded) {
      // Expand animation - spread apart
      avatarSpacing.value = withTiming(EXPANDED_SPACING, { duration, easing });
      nameOpacity.value = withTiming(1, { duration: duration + 50, easing });
      nameHeight.value = withTiming(20, { duration, easing });
    } else {
      // Collapse animation - overlap
      nameOpacity.value = withTiming(0, { duration: duration - 50, easing });
      avatarSpacing.value = withTiming(OVERLAP_OFFSET, { duration, easing });
      nameHeight.value = withTiming(0, { duration, easing });
    }
  }, [expanded]);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {displayFriends.map((friend, index) => (
          <AvatarStackItem
            key={friend.id}
            friend={friend}
            index={index}
            expanded={expanded}
            avatarSpacing={avatarSpacing}
            nameOpacity={nameOpacity}
            nameHeight={nameHeight}
          />
        ))}

        {/* +X indicator if there are more friends */}
        {extraCount > 0 && (
          <StackExtraBadge
            extraCount={extraCount}
            expanded={expanded}
            avatarSpacing={avatarSpacing}
            nameOpacity={nameOpacity}
            nameHeight={nameHeight}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  avatarItem: {
    alignItems: 'center',
    maxWidth: 60,
  },
  extraBadge: {
    width: AVATAR_STACK_SIZE,
    height: AVATAR_STACK_SIZE,
    borderRadius: AVATAR_STACK_SIZE / 2,
    backgroundColor: CORNFLOWER_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraText: {
    fontSize: 12,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  friendNameText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'black',
    fontFamily: CustomFonts.ztnaturemedium,
    textAlign: 'center',
  },
});
