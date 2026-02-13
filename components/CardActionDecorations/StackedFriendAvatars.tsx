import Avatar from "@/components/Avatar/Avatar";
import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Contacts/types";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface StackedFriendAvatarsProps {
  selectedFriends: Friend[];
  expanded?: boolean;
}

const AVATAR_SIZE = 30; // ~15% smaller than Friend.tsx's 48px
const MAX_VISIBLE_AVATARS = 4;

// Separate component for each avatar to ensure stable hook calls
interface AvatarItemProps {
  friend: Friend;
  index: number;
  expanded: boolean;
  avatarSpacing: any;
  nameOpacity: any;
  nameHeight: any;
}

function AvatarItem({ friend, index, expanded, avatarSpacing, nameOpacity, nameHeight }: AvatarItemProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    marginLeft: index === 0 ? 0 : avatarSpacing.value,
  }));

  const animatedNameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    height: nameHeight.value,
    marginTop: expanded ? 4 : 0,
  }));

  return (
    <Animated.View key={friend.id} style={[styles.avatarItem, animatedStyle]}>
      <Avatar
        name={friend.name}
        avatarUrl={friend.avatarUrl}
        size={AVATAR_SIZE}
        borderColor={CREAM}
        borderWidth={1.5}
      />
            <Animated.View style={animatedNameStyle}>
        {expanded && (
          <Text style={styles.friendNameText} numberOfLines={1}>
            {friend.name}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// Separate component for the extra badge
interface ExtraBadgeProps {
  extraCount: number;
  expanded: boolean;
  avatarSpacing: any;
  nameOpacity: any;
  nameHeight: any;
}

function ExtraBadge({ extraCount, expanded, avatarSpacing, nameOpacity, nameHeight }: ExtraBadgeProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    marginLeft: avatarSpacing.value,
  }));

  const animatedNameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    height: nameHeight.value,
    marginTop: expanded ? 4 : 0,
  }));

  return (
    <Animated.View style={[styles.avatarItem, animatedStyle]}>
      <View style={styles.extraBadge}>
        <Text style={styles.extraText}>+{extraCount}</Text>
      </View>
      <Animated.View style={animatedNameStyle}>
        {expanded && (
          <Text style={styles.friendNameText} numberOfLines={1}>
            {extraCount} more
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * StackedFriendAvatars - Displays selected friends as stacked/fanned avatars
 *
 * Shows up to 4 friend avatars overlapping in a fanned-out card style.
 * If more than 4 friends are selected, shows a "+X" indicator.
 * Animates smoothly between collapsed and expanded states.
 *
 * Usage:
 * ```tsx
 * <StackedFriendAvatars
 *   selectedFriends={friendsList}
 *   expanded={isExpanded}
 * />
 * ```
 */
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
  const OVERLAP_OFFSET = -(AVATAR_SIZE * 0.7); // -28px for 40px avatars
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
          <AvatarItem
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
          <ExtraBadge
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
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
    color: CREAM,
    fontFamily: CustomFonts.ztnaturemedium,
    textAlign: 'center',
  },
});
