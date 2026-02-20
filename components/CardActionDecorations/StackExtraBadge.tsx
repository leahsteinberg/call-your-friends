import { CustomFonts } from "@/constants/theme";
import { AVATAR_STACK_SIZE } from "@/constants/ui_constants";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

// Separate component for the extra badge
interface ExtraBadgeProps {
    extraCount: number;
    expanded: boolean;
    avatarSpacing: any;
    nameOpacity: any;
    nameHeight: any;
  }
  export default function StackExtraBadge({ extraCount, expanded, avatarSpacing, nameOpacity, nameHeight }: ExtraBadgeProps) {
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