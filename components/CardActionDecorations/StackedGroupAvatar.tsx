import Avatar from "@/components/Avatar/Avatar";
import { CustomFonts } from "@/constants/theme";
import { AVATAR_STACK_SIZE } from "@/constants/ui_constants";
import type { Group } from "@/services/groupsApi";
import { BURGUNDY, CORNFLOWER_BLUE, CREAM, FUN_PURPLE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StackedGroupAvatarProps {
  group: Group;
}

const MAX_VISIBLE_MEMBERS = 3;
const OVERLAP_OFFSET = -(AVATAR_STACK_SIZE * 0.7); // 70% overlap

/**
 * StackedGroupAvatar - Static stacked avatars for a group
 *
 * Shows the first 3 members of a group as overlapping avatars with the group name below.
 * No animations - this is a static representation.
 */
export default function StackedGroupAvatar({ group }: StackedGroupAvatarProps): React.JSX.Element {
  const displayMembers = group.members.slice(0, MAX_VISIBLE_MEMBERS);
  const extraCount = group.members.length - MAX_VISIBLE_MEMBERS;

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        {displayMembers.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.avatarItem,
              index > 0 && { marginLeft: OVERLAP_OFFSET },
            ]}
          >
            <Avatar.MiniAvatar
              name={member.displayUsername}
              avatarUrl={member.avatarUrl}
            />
          </View>
        ))}

        {/* +X indicator if there are more members */}
        {extraCount > 0 && (
          <View
            style={[
              styles.extraBadge,
              { marginLeft: OVERLAP_OFFSET },
            ]}
          >
            <Text style={styles.extraText}>+{extraCount}</Text>
          </View>
        )}
      </View>

      {/* Group name below avatars */}
      <Text style={styles.groupName} numberOfLines={1}>
        {group.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarItem: {
    // No additional styles needed - overlap handled by marginLeft
  },
  extraBadge: {
    width: AVATAR_STACK_SIZE,
    height: AVATAR_STACK_SIZE,
    borderRadius: AVATAR_STACK_SIZE / 2,
    backgroundColor: FUN_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CREAM,
  },
  extraText: {
    fontSize: 11,
    fontWeight: '700',
    color: CREAM,
    fontFamily: CustomFonts.ztnaturebold,
  },
  groupName: {
    fontSize: 11,
    fontWeight: '600',
    color: BURGUNDY,
    fontFamily: CustomFonts.ztnaturebold,
    textAlign: 'center',
    maxWidth: 120,
  },
});
