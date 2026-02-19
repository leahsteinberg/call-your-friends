import { CustomFonts } from "@/constants/theme";
import { AVATAR_STACK_SIZE } from "@/constants/ui_constants";
import { Friend } from "@/features/Friends/types";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Avatar from "./Avatar";

// Separate component for each avatar to ensure stable hook calls
interface AvatarItemProps {
    friend: Friend;
    index: number;
    expanded: boolean;
    avatarSpacing: any;
    nameOpacity: any;
    nameHeight: any;
  }
  
export default function AvatarStackItem({ friend, index, expanded, avatarSpacing, nameOpacity, nameHeight }: AvatarItemProps) {
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
        <Avatar.MiniAvatar
          name={friend.name}
          avatarUrl={friend.avatarUrl}
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

