import { CARD_LOWER_MARGIN, CARD_MIN_HEIGHT, CustomFonts } from '@/constants/theme';
import { BOLD_BROWN, BURGUNDY, CREAM, PALE_BLUE } from '@/styles/styles';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

// ============================================
// ROOT COMPONENT
// ============================================
interface EventCardProps {
  children: React.ReactNode;
  backgroundColor: string;
  gesture?: React.ComponentType<{ children: React.ReactNode }>;
  onPress?: () => void;
  disabled?: boolean;
}

export function EventCard({
  children,
  backgroundColor,
  gesture,
  onPress,
  disabled
}: EventCardProps) {
  const GestureWrapper = gesture || React.Fragment;
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.outerContainer}>
      <GestureWrapper>
        <Wrapper
          style={[styles.container, { backgroundColor }]}
          onPress={onPress}
          disabled={disabled}
        >
          {children}
        </Wrapper>
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
  animated = false
}: TitleProps) {
  const fontSize = size === 'large' ? 28 : size === 'medium' ? 22 : 18;
  const Component = animated ? Animated.Text : Text;

  return (
    <Component style={[styles.titleText, { fontSize, color }]}>
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
  size = 20
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
// STYLES
// ============================================
const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: CARD_LOWER_MARGIN,
    position: 'relative',
    marginHorizontal: 10,
  },
  container: {
    borderRadius: 8,
    padding: 18,
    overflow: 'visible',
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
  descriptionText: {
    fontFamily: CustomFonts.ztnaturemedium,
    opacity: 0.8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: CustomFonts.ztnatureregular,
  },
  button: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: BURGUNDY,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CREAM,
  },
  buttonDanger: {
    backgroundColor: PALE_BLUE,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonMedium: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonLarge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
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
});
