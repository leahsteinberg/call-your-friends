import { useAnimatedStyle } from "react-native-reanimated";

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