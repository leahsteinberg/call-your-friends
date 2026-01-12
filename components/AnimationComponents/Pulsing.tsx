import { CORNFLOWER_BLUE, CREAM, PALE_BLUE } from '@/styles/styles';
import React, { useEffect, useState } from 'react';

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
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';


export default function Pulsing({onPress, isEnabled, children}: {onPress: ()=> void, isEnabled: boolean}): React.JSX.Element {
    const value = useSharedValue(isEnabled === false ? 0 : 1);
  const pulseScale = useSharedValue(1);
  const pulseColor = useSharedValue(1);
  const [fillColor, setFillColor] = useState(isEnabled ? CORNFLOWER_BLUE : CREAM);

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
            withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
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

  // Derive the animated color value
  const animatedColor = useDerivedValue(() => {
    // Color transitions smoothly, then pulses when fully ON
    const color = value.value > 0.99 && pulseColor.value < 0.95
      ? interpolateColor(
          pulseColor.value,
          [0, 1],
          [PALE_BLUE, CORNFLOWER_BLUE]
        )
      : interpolateColor(
          value.value,
          [0, 1],
          [CREAM, CORNFLOWER_BLUE]
        );
    return color;
  });

  // Update React state when animated color changes
  useAnimatedReaction(
    () => animatedColor.value,
    (color) => {
      setFillColor(color);
    }
  );



  const sizeAnimatedStyle = useAnimatedStyle(() => {
    // Base scale from toggle (0.3 to 1)
    const baseScale = interpolate(
        value.value,
        [0, 1],
        [0.7, 1]
    );
    // Combine base scale with pulse (multiply them)
    const finalScale = baseScale * pulseScale.value;

    // Color transitions smoothly, then pulses when fully ON
    // Only use pulse color after it has started animating (moved away from initial value of 1)
    // const color = value.value > 0.99 && pulseColor.value < 0.95
    //   ? interpolateColor(
    //       pulseColor.value,
    //       [0, 1],
    //       [PALE_BLUE, CORNFLOWER_BLUE]
    //     )
    //   : interpolateColor(
    //       value.value,
    //       [0, 1],
    //       [PALE_BLUE, CORNFLOWER_BLUE]
    //     );

    return {
        transform: [{ scale: finalScale }],
        //backgroundColor: color,
    };
  });

  return (
    <Pressable style={styles.container} onPress={onPress}>
        <View style={styles.dotContainer}>
            <Animated.View
                style={[styles.thumb, sizeAnimatedStyle]}>
                    {children}
            </Animated.View>
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({

});
