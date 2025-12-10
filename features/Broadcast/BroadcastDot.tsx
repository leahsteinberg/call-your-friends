import { CORNFLOWER_BLUE, CREAM, DARK_GREEN, PALE_BLUE } from '@/styles/styles';
import React, { useEffect } from 'react';
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


export default function BroadcastDot({onPress, isEnabled}: {onPress: ()=> void, isEnabled: boolean}): React.JSX.Element {
    const value = useSharedValue(isEnabled === false ? 0 : 1);
  const pulseScale = useSharedValue(1);
  const pulseColor = useSharedValue(1);

  // Update value when isEnabled prop changes
  useEffect(() => {
    value.value = withTiming(
      isEnabled ? 1 : 0,
      { duration: 800, easing: Easing.in(Easing.elastic(1.5)) }
    );
  }, [isEnabled]);

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
    <View style={styles.container}>
        <Pressable onPress={onPress}>
            <Animated.View
          style={[styles.thumb, sizeAnimatedStyle]}/>
        {isEnabled ?
            <View
            
            /> 
            : 
                <View
                />
        }
      {/* <Switch isEnabled={isEnabled} onPress={onPress}  /> */}
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    minHeight: 60,
    minWidth: 60,
    padding: 5,
    aspectRatio: 1,
    backgroundColor: DARK_GREEN,
    borderRadius: 50,
  },
});
