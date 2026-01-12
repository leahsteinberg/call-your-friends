import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, BURGUNDY, CREAM } from "@/styles/styles";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

interface CallIntentDecoratorProps {
  isVisible: boolean;
  onNeverMind: () => void;
  isLoading?: boolean;
}

/**
 * CallIntentDecorator - "remind me" bubble with "never mind" modal
 *
 * Displays a "remind me" text bubble that opens a modal with a "never mind" button when tapped.
 * Similar to TapbackDecoration style.
 *
 * Usage:
 * ```tsx
 * <View style={{ position: 'relative' }}>
 *   <CallIntentDecorator
 *     isVisible={isContactIntended}
 *     onNeverMind={handleNeverMind}
 *     isLoading={isUndoing}
 *   />
 *   <YourCardContent />
 * </View>
 * ```
 */
export default function CallIntentDecorator({
  isVisible,
  onNeverMind,
  isLoading = false
}: CallIntentDecoratorProps): React.JSX.Element | null {
  const [showNeverMindModal, setShowNeverMindModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const decoratorRef = useRef<View>(null);

  // Animation values for modal
  const modalTranslateY = useSharedValue(20);
  const modalOpacity = useSharedValue(0);

  // Trigger animation when modal appears
  useEffect(() => {
    if (showNeverMindModal) {
      modalTranslateY.value = 20;
      modalOpacity.value = 0;

      modalTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      modalOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.linear,
      });
    }
  }, [showNeverMindModal]);

  // Handle tapping the "remind me" decorator to show modal
  const handleDecoratorPress = () => {
    decoratorRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Position modal near the decorator
      setModalPosition({
        x: pageX + width / 2,
        y: pageY + height + 8, // 8px below the decorator
      });
      setShowNeverMindModal(true);
    });
  };

  // Handle never mind button press
  const handleNeverMindPress = () => {
    setShowNeverMindModal(false);
    onNeverMind();
  };

  // Create animated style for modal
  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <>
      {/* "remind me" Decorator */}
      <TouchableOpacity
        ref={decoratorRef}
        style={styles.callIntentDecorator}
        onPress={handleDecoratorPress}
        activeOpacity={0.7}
      >
        <Text style={styles.decoratorText}>we'll help you talk to them soon</Text>
      </TouchableOpacity>

      {/* Never Mind Modal */}
      <Modal
        visible={showNeverMindModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowNeverMindModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowNeverMindModal(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.neverMindModalContainer,
                {
                  position: 'absolute',
                  left: modalPosition.x - 60, // Center the modal (120px width / 2)
                  top: modalPosition.y,
                },
                animatedModalStyle,
              ]}
            >
              <TouchableOpacity
                style={styles.neverMindModalButton}
                onPress={handleNeverMindPress}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={BURGUNDY} />
                ) : (
                  <Text style={styles.neverMindModalText}>Never Mind</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  callIntentDecorator: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: CREAM,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: BOLD_BLUE,
  },
  decoratorText: {
    fontSize: 12,
    fontWeight: '600',
    color: BOLD_BLUE,
    fontFamily: CustomFonts.ztnaturemedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  neverMindModalContainer: {
    backgroundColor: CREAM,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  neverMindModalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  neverMindModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: BURGUNDY,
    fontFamily: CustomFonts.ztnaturemedium,
  },
});
