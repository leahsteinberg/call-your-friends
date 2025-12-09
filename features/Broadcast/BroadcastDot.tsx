import { CORNFLOWER_BLUE, CREAM, DARK_GREEN, PALE_BLUE } from '@/styles/styles';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const Switch = ({
  value,
  onPress,
}) => {
  const pulseScale = useSharedValue(1);
  const pulseColor = useSharedValue(1);

  // Watch the value and start/stop pulse animation
  useAnimatedReaction(
    () => value.value,
    (current) => {
      if (current === 1) {
        // Start pulsing when ON
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Repeat indefinitely
          false
        );
        pulseColor.value = withDelay(1000, withRepeat(
          withSequence(
            withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Repeat indefinitely
          false
        ));

      } else {
        // Stop pulsing when OFF
        pulseScale.value = withTiming(1, { duration: 300 });
        pulseColor.value = withTiming(1, { duration: 300 });
      }
    }
  );

const colorAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
        value.value,
        [0, 1],
        [CREAM, CORNFLOWER_BLUE]
      );
    const colorValue = withTiming(color, {duration: 100, });
    return {
        backgroundColor: colorValue,
    };
})


  const sizeAnimatedStyle = useAnimatedStyle(() => {
    // Base scale from toggle (0.3 to 1)
    const baseScale = interpolate(
        value.value,
        [0, 1],
        [0.3, 1]
    );

    // Combine base scale with pulse (multiply them)
    const finalScale = baseScale * pulseScale.value;

    // Color transitions smoothly, then pulses when fully ON
    // Only use pulse color after it has started animating (moved away from initial value of 1)
    const color = value.value > 0.99 && pulseColor.value < 0.95
      ? interpolateColor(
          pulseColor.value,
          [0, 1],
          [PALE_BLUE, CORNFLOWER_BLUE]
        )
      : interpolateColor(
          value.value,
          [0, 1],
          [PALE_BLUE, CORNFLOWER_BLUE]
        );

    return {
        transform: [{ scale: finalScale }],
        backgroundColor: color,
    };
  });

  return (
    <Pressable onPress={onPress}>
        <Animated.View
          style={[switchStyles.thumb, sizeAnimatedStyle]}/>
    </Pressable>
  );
};

const switchStyles = StyleSheet.create({
  thumb: {
    minHeight: 60,
    minWidth: 60,
    padding: 5,
    aspectRatio: 1,
    backgroundColor: DARK_GREEN,
    borderRadius: 50,
  },
});

export default function BroadcastDot({onPress, isEnabled}): React.JSX.Element {
    const isOn = useSharedValue(isEnabled ? 1 : 0);

  const handlePress = () => {
    isOn.value = withTiming(
        isOn.value === 0 ? 1 : 0,
        { duration: 800, easing: Easing.in(Easing.elastic(1.5))}
    );
    onPress();
  };

  return (
    <View style={styles.container}>
      <Switch value={isOn} onPress={handlePress}  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
