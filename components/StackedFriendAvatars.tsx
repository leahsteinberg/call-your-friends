import { CustomFonts } from "@/constants/theme";
import type { Friend } from "@/features/Contacts/types";
import { BOLD_BLUE, CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StackedFriendAvatarsProps {
  selectedFriendIds: string[];
  allFriends: Friend[];
  expanded?: boolean;
}

const AVATAR_SIZE = 40; // ~15% smaller than Friend.tsx's 48px
const OVERLAP_PERCENTAGE = 0.7;
const MAX_VISIBLE_AVATARS = 4;

/**
 * StackedFriendAvatars - Displays selected friends as stacked/fanned avatars
 *
 * Shows up to 4 friend avatars overlapping in a fanned-out card style.
 * If more than 4 friends are selected, shows a "+X" indicator.
 *
 * Usage:
 * ```tsx
 * <StackedFriendAvatars
 *   selectedFriendIds={['id1', 'id2', 'id3']}
 *   allFriends={friendsList}
 * />
 * ```
 */
export default function StackedFriendAvatars({
  selectedFriendIds,
  allFriends,
  expanded = false,
}: StackedFriendAvatarsProps): React.JSX.Element | null {
  // Don't show anything if no friends are selected
  if (!selectedFriendIds || selectedFriendIds.length === 0) {
    return null;
  }

  // Filter to get only selected friends
  const selectedFriends = allFriends.filter(friend =>
    selectedFriendIds.includes(friend.id)
  );

  // Get the friends to display (max 4)
  const displayFriends = selectedFriends.slice(0, MAX_VISIBLE_AVATARS);

  // Calculate how many extra friends there are
  const extraCount = selectedFriends.length - MAX_VISIBLE_AVATARS;

  // Calculate the offset for each avatar (30% of size since we want 70% overlap)
  const offset = AVATAR_SIZE * (1 - OVERLAP_PERCENTAGE);

  // Calculate the width needed for the avatar stack
  // Width = (number of avatars - 1) * offset + one full avatar size
  const avatarsWidth = displayFriends.length > 0
    ? (displayFriends.length - 1) * offset + AVATAR_SIZE
    : 0;

  // If there's an extra badge, add space for it (positioned at displayFriends.length * offset)
  const totalWidth = extraCount > 0
    ? displayFriends.length * offset + 40 // 40px for the badge approximate width
    : avatarsWidth;

  // Render expanded view when expanded prop is true
  if (expanded) {
    const EXPANDED_AVATAR_SIZE = 48; // Slightly bigger when expanded
    const AVATAR_SPACING = 12; // Space between avatars

    return (
      <View style={styles.expandedContainer}>
        {displayFriends.map((friend, index) => (
          <View key={friend.id} style={styles.expandedAvatarItem}>
            <View
              style={[
                styles.expandedAvatar,
                {
                  width: EXPANDED_AVATAR_SIZE,
                  height: EXPANDED_AVATAR_SIZE,
                  borderRadius: EXPANDED_AVATAR_SIZE / 2,
                },
              ]}
            >
              <Text style={styles.expandedAvatarText}>
                {friend.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.friendNameText} numberOfLines={1}>
              {friend.name}
            </Text>
          </View>
        ))}
        {extraCount > 0 && (
          <View style={styles.expandedAvatarItem}>
            <View
              style={[
                styles.expandedExtraBadge,
                {
                  width: EXPANDED_AVATAR_SIZE,
                  height: EXPANDED_AVATAR_SIZE,
                  borderRadius: EXPANDED_AVATAR_SIZE / 2,
                },
              ]}
            >
              <Text style={styles.expandedExtraText}>+{extraCount}</Text>
            </View>
            <Text style={styles.friendNameText} numberOfLines={1}>
              {extraCount} more
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Render stacked/collapsed view (default)
  return (
    <View style={styles.container}>
      {/* Stacked avatars */}
      <View style={[styles.avatarStack, { width: totalWidth }]}>
        {displayFriends.map((friend, index) => (
          <View
            key={friend.id}
            style={[
              styles.avatar,
              {
                left: index * offset,
                zIndex: MAX_VISIBLE_AVATARS - index, // Reverse z-index so first is on top
              },
            ]}
          >
            <Text style={styles.avatarText}>
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      {/* +X indicator if there are more friends */}
      {extraCount > 0 && (
        <View
          style={[
            styles.extraBadge,
            {
              left: displayFriends.length * offset,
            },
          ]}
        >
          <Text style={styles.extraText}>+{extraCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: AVATAR_SIZE,
  },
  avatarStack: {
    flexDirection: 'row',
    position: 'relative',
  },
  avatar: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: PALE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CORNFLOWER_BLUE,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  extraBadge: {
    position: 'absolute',
    minWidth: 32,
    height: 24,
    borderRadius: 12,
    backgroundColor: CORNFLOWER_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  extraText: {
    fontSize: 12,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  // Expanded view styles
  expandedContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  expandedAvatarItem: {
    alignItems: 'center',
    maxWidth: 60,
  },
  expandedAvatar: {
    backgroundColor: PALE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CORNFLOWER_BLUE,
    marginBottom: 4,
  },
  expandedAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturebold,
  },
  expandedExtraBadge: {
    backgroundColor: CORNFLOWER_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedExtraText: {
    fontSize: 14,
    fontWeight: '600',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  friendNameText: {
    fontSize: 10,
    fontWeight: '500',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturemedium,
    textAlign: 'center',
  },
});
