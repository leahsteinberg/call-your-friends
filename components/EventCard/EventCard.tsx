import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from '@/constants/theme';
import { BOLD_BROWN, BURGUNDY, CREAM, PALE_BLUE, TRANSPARENT_CREAM } from '@/styles/styles';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ============================================
// NEUMORPHISM CONFIGURATION
// ============================================
const NEUMORPHIC = {
  // Shadow colors for the raised effect
  lightShadow: CREAM,//'rgba(255, 255, 255, 0.7)',
  darkShadow: 'rgba(0, 0, 0, 0.25)',
  // Background tint (medium transparency with dark tint)
  backgroundTint: 'rgba(0, 0, 0, 0.08)',
  // Border for subtle definition
  borderColor: 'rgba(255, 255, 255, 0.15)',
  // Shadow offset for raised state
  shadowOffset: 6,
  // Shadow blur
  shadowBlur: 12,
};

// ============================================
// ROOT COMPONENT
// ============================================
interface EventCardProps {
  children: React.ReactNode;
  backgroundColor?: string; // Now optional - defaults to transparent neumorphic
  gesture?: React.ComponentType<{ children: React.ReactNode }>;
  onPress?: () => void;
  disabled?: boolean;
  hasBanner?: boolean;
  variant?: 'solid' | 'neumorphic'; // Allow switching between old and new style
  showTint?: boolean;   // Neumorphic background tint (default true)
  showBorder?: boolean; // Neumorphic border (default true)
}

export function EventCard({
  children,
  backgroundColor,
  gesture,
  onPress,
  disabled,
  hasBanner = false,
  variant = 'neumorphic',
  showTint = true,
  showBorder = true,
}: EventCardProps) {
  const GestureWrapper = gesture || React.Fragment;
  const pressed = useSharedValue(0);

  // When banner is attached, remove bottom border radius from the card
  const bannerRadiusOverride = hasBanner ? {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  } : {};

  // Animated styles for press effect
  const animatedLightShadow = useAnimatedStyle(() => {
    const offset = interpolate(pressed.value, [0, 1], [NEUMORPHIC.shadowOffset, 2]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.3]);
    return {
      shadowOffset: { width: -offset, height: -offset },
      shadowOpacity: opacity,
    };
  });

  const animatedDarkShadow = useAnimatedStyle(() => {
    const offset = interpolate(pressed.value, [0, 1], [NEUMORPHIC.shadowOffset, 2]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.3]);
    return {
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: opacity,
    };
  });

  const animatedContent = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return {
      transform: [{ scale }],
    };
  });

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  // Use solid variant (original style)
  if (variant === 'solid') {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <View style={styles.outerContainer}>
        <GestureWrapper>
          <View style={[styles.cardContainer, { backgroundColor }, bannerRadiusOverride]}>
            <Wrapper
              style={[styles.container, bannerRadiusOverride]}
              onPress={onPress}
              disabled={disabled}
            >
              {children}
            </Wrapper>
          </View>
        </GestureWrapper>
      </View>
    );
  }

  // Neumorphic variant (new transparent style)
  return (
    <View style={styles.outerContainer}>
      <GestureWrapper>
        <View style={[styles.neumorphicWrapper, bannerRadiusOverride]}>
          {/* Light shadow layer (top-left) */}
          <Animated.View
            style={[
              styles.shadowLayerLight,
              bannerRadiusOverride,
              animatedLightShadow,
            ]}
          />
          {/* Dark shadow layer (bottom-right) */}
          <Animated.View
            style={[
              styles.shadowLayerDark,
              bannerRadiusOverride,
              animatedDarkShadow,
            ]}
          />
          {/* Main content */}
          <Pressable
            onPress={onPress}
            onPressIn={onPress ? handlePressIn : undefined}
            onPressOut={onPress ? handlePressOut : undefined}
            disabled={disabled}
            style={[
              styles.neumorphicContainer,
              bannerRadiusOverride,
              !showTint && { backgroundColor: 'transparent' },
              !showBorder && { borderWidth: 0 },
            ]}
          >
            <Animated.View style={[styles.neumorphicContent, animatedContent]}>
              {children}
            </Animated.View>
          </Pressable>
        </View>
      </GestureWrapper>
    </View>
  );
}

// ============================================
// HEADER SECTION
// ============================================
interface HeaderProps {
  children: React.ReactNode;
  spacing?: 'between' | 'start' | 'end' | 'center';
  align?: 'start' | 'center' | 'end';
}

EventCard.Header = function Header({ children, spacing = 'between', align = 'start' }: HeaderProps) {
  const justifyContentMap = {
    between: 'space-between' as const,
    start: 'flex-start' as const,
    end: 'flex-end' as const,
    center: 'center' as const,
  };

  return (
    <View style={[
      styles.header,
      {
        justifyContent: justifyContentMap[spacing],
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center'
      }
    ]}>
      {children}
    </View>
  );
};

// ============================================
// TEXT COMPONENTS
// ============================================
interface TitleProps {
  children: React.ReactNode;
  size?: 'large' | 'medium' | 'small';
  color?: string;
  animated?: boolean;
}

EventCard.Title = function Title({
  children,
  size = 'large',
  color = CREAM,
  animated = false,
}: TitleProps) {
  const fontSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;
  const Component = animated ? Animated.Text : Text;

  return (
    <Component style={[styles.titleText, { fontSize, color }]}>
      {children}
    </Component>
  );
};

EventCard.LiveTitle = function LiveTitle({
  children,
  size = 'large',
  color = CREAM,
  animated = false,
}: TitleProps) {
  const fontSize = size === 'extralarge' ? 30 : size === 'large' ? 27 : size === 'medium' ? 20 : 16;
  const Component = animated ? Animated.Text : Text;

  return (
    <Component style={[styles.liveTitleText, { fontSize, color }]}>
      {children}
    </Component>
  );
};

interface DescriptionProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
}

EventCard.Description = function Description({
  children,
  color = BOLD_BROWN,
  size = 16
}: DescriptionProps) {
  return (
    <Text style={[styles.descriptionText, { color, fontSize: size }]}>
      {children}
    </Text>
  );
};

EventCard.StatusText = function StatusText({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <Text style={[styles.statusText, color && { color }]}>
      {children}
    </Text>
  );
};

// ============================================
// BODY SECTION
// ============================================
EventCard.Body = function Body({ children }: { children: React.ReactNode }) {
  return <View style={styles.body}>{children}</View>;
};

// ============================================
// ACTIONS SECTION
// ============================================
interface ActionsProps {
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
  spacing?: number;
}

EventCard.Actions = function Actions({
  children,
  layout = 'horizontal',
  spacing = 8
}: ActionsProps) {
  return (
    <View style={[
      styles.actions,
      {
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        gap: spacing
      }
    ]}>
      {children}
    </View>
  );
};

// ============================================
// BUTTON COMPONENT
// ============================================
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

EventCard.Button = function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium'
}: ButtonProps) {
  const variantStyles: Record<string, ViewStyle> = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    danger: styles.buttonDanger,
    ghost: styles.buttonGhost,
  };

  const sizeStyles: Record<string, ViewStyle> = {
    small: styles.buttonSmall,
    medium: styles.buttonMedium,
    large: styles.buttonLarge,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        (loading || disabled) && styles.buttonDisabled
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

// ============================================
// DECORATION COMPONENT
// ============================================
interface DecorationProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'right-edge';
}

EventCard.Decoration = function Decoration({ children, position = 'top-right' }: DecorationProps) {
  const positionStyles: Record<string, ViewStyle> = {
    'top-left': { top: -10, left: -10 },
    'top-right': { top: -10, right: -10 },
    'bottom-left': { bottom: -10, left: -10 },
    'bottom-right': { bottom: -10, right: -10 },
    'right-edge': { right: 10, top: '50%' },
  };

  return (
    <View style={[styles.decoration, positionStyles[position]]}>
      {children}
    </View>
  );
};

// ============================================
// ROW HELPER (for grouping elements)
// ============================================
EventCard.Row = function Row({ children, gap = 4 }: { children: React.ReactNode; gap?: number }) {
  return <View style={[styles.row, { gap }]}>{children}</View>;
};

// ============================================
// PILL COMPONENT (top center inside the card)
// ============================================
interface PillProps {
  children: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

EventCard.Pill = function Pill({
  children,
  backgroundColor = BURGUNDY,
  textColor = CREAM,
}: PillProps) {
  return (
    <View style={styles.pillWrapper}>
      <View style={[styles.pill, { backgroundColor }]}>
        <Text style={[styles.pillText, { color: textColor }]}>{children}</Text>
      </View>
    </View>
  );
};

// ============================================
// BANNER COMPONENT (slides out from under card)
// ============================================
interface BannerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  visible: boolean;
  pulsing?: boolean;
}

const BANNER_HEIGHT = 70;

EventCard.Banner = function Banner({
  children,
  backgroundColor = BURGUNDY,
  visible,
  pulsing = false,
}: BannerProps) {
  const translateY = useSharedValue(-BANNER_HEIGHT);
  const opacity = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Slide out from under the card
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 90,
        mass: 1,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Slide back under the card
      translateY.value = withSpring(-BANNER_HEIGHT, {
        damping: 20,
        stiffness: 120,
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  // Pulsing animation when active/happening
  useEffect(() => {
    if (pulsing && visible) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [pulsing, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value * pulseOpacity.value,
  }));

  return (
    <View style={styles.bannerClipContainer}>
      <Animated.View
        style={[
          styles.bannerContainer,
          { backgroundColor },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: CARD_LOWER_MARGIN,
    position: 'relative',
    marginHorizontal: 10,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 20,

  },
  // Original solid card styles
  cardContainer: {
    borderRadius: 20,
    minHeight: CARD_MIN_HEIGHT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  container: {
    borderRadius: 20,
    padding: 20,
    overflow: 'visible',
    minHeight: CARD_MIN_HEIGHT,
  },
  // Neumorphic styles
  neumorphicWrapper: {
    position: 'relative',
    borderRadius: 20,
    minHeight: CARD_MIN_HEIGHT,
  },
  shadowLayerLight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    ...Platform.select({
      ios: {
        shadowColor: NEUMORPHIC.lightShadow,
        shadowOffset: { width: -NEUMORPHIC.shadowOffset, height: -NEUMORPHIC.shadowOffset },
        shadowOpacity: 1,
        shadowRadius: NEUMORPHIC.shadowBlur,
      },
      android: {
        elevation: 4,
      },
      web: {
        // Shadows applied to container on web, hide this layer
        display: 'none',
      },
    }),
  },
  shadowLayerDark: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    ...Platform.select({
      ios: {
        shadowColor: NEUMORPHIC.darkShadow,
        shadowOffset: { width: NEUMORPHIC.shadowOffset, height: NEUMORPHIC.shadowOffset },
        shadowOpacity: 1,
        shadowRadius: NEUMORPHIC.shadowBlur,
      },
      android: {
        elevation: 6,
      },
      web: {
        // Shadows applied to container on web, hide this layer
        display: 'none',
      },
    }),
  },
  neumorphicContainer: {
    borderRadius: 20,
    minHeight: CARD_MIN_HEIGHT,
    backgroundColor: NEUMORPHIC.backgroundTint,
    borderWidth: 1,
    borderColor: NEUMORPHIC.borderColor,
    overflow: 'visible',
    ...Platform.select({
      web: {
        // On web, apply both shadows directly to container (cleaner than separate layers)
        boxShadow: `${-NEUMORPHIC.shadowOffset}px ${-NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur}px ${NEUMORPHIC.lightShadow}, ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowOffset}px ${NEUMORPHIC.shadowBlur}px ${NEUMORPHIC.darkShadow}`,
      },
    }),
  },
  neumorphicContent: {
    padding: 20,
    minHeight: CARD_MIN_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  body: {
    // No specific styles, just a semantic wrapper
  },
  actions: {
    marginTop: 8,
  },
  titleText: {
    fontWeight: '600',
    fontFamily: CustomFonts.ztnaturebold,
    flexShrink: 1,
  },
  liveTitleText: {
    //color: CREAM,
    marginVertical: 15,
    fontFamily: CustomFonts.awalierbold,
    letterSpacing: 1,
    flexShrink: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: CustomFonts.ztnaturemedium,
    opacity: 0.8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: CustomFonts.ztnatureregular,
  },
  button: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: BURGUNDY,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonDanger: {
    backgroundColor: PALE_BLUE,
  },
  buttonGhost: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  buttonMedium: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  buttonLarge: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 26,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  decoration: {
    position: 'absolute',
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  bannerClipContainer: {
    overflow: 'hidden',
    marginTop: -20, // Overlap with card above
    marginHorizontal: 0,
  },
  bannerContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 24, // Extra padding to account for overlap
    paddingBottom: 14,
    paddingHorizontal: 16,
    marginHorizontal: 10,
  },
  pillWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: TRANSPARENT_CREAM,
  },
  pillText: {
    fontSize: 16,
    fontFamily: CustomFonts.ztnaturebold,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
