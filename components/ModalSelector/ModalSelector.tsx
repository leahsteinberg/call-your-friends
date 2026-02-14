import { CREAM } from "@/styles/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type HorizontalAnchor = "left" | "right";
type VerticalAnchor = "above" | "below";

interface ModalSelectorProps {
    /** The trigger element that opens the modal when pressed. Rendered inline. */
    trigger: (onPress: () => void) => React.ReactNode;
    /** Content rendered inside the modal dropdown. */
    children: React.ReactNode;
    /** Whether the modal is currently visible (controlled mode). */
    visible?: boolean;
    /** Called when the modal should close (backdrop tap or programmatic). */
    onClose?: () => void;
    /** Horizontal alignment relative to trigger. Default "right". */
    horizontalAnchor?: HorizontalAnchor;
    /** Vertical placement relative to trigger. Default "below". */
    verticalAnchor?: VerticalAnchor;
    /** Width of the modal container. Default 220. */
    modalWidth?: number;
    /** Max height of the modal container. Default 320. */
    modalMaxHeight?: number;
    /** Custom styles for the modal container. */
    modalStyle?: ViewStyle;
}

export default function ModalSelector({
    trigger,
    children,
    visible: controlledVisible,
    onClose,
    horizontalAnchor = "right",
    verticalAnchor = "below",
    modalWidth = 220,
    modalMaxHeight = 320,
    modalStyle,
}: ModalSelectorProps) {
    const triggerRef = useRef<View>(null);

    // Support both controlled and uncontrolled modes
    const [internalVisible, setInternalVisible] = useState(false);
    const isControlled = controlledVisible !== undefined;
    const showSelector = isControlled ? controlledVisible : internalVisible;

    const [modalRendered, setModalRendered] = useState(false);
    const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });

    // Animation
    const modalScale = useSharedValue(0.8);
    const modalOpacity = useSharedValue(0);

    useEffect(() => {
        if (showSelector) {
            setModalRendered(true);
            modalScale.value = 0.8;
            modalOpacity.value = 0;
            modalScale.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
            modalOpacity.value = withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) });
        } else if (modalRendered) {
            modalScale.value = withTiming(0.8, { duration: 200, easing: Easing.inOut(Easing.ease) });
            modalOpacity.value = withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) });
            setTimeout(() => setModalRendered(false), 200);
        }
    }, [showSelector]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: modalScale.value }],
        opacity: modalOpacity.value,
    }));

    const handleOpen = useCallback(() => {
        triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
            const x = horizontalAnchor === "left" ? pageX : pageX + width - modalWidth;
            const y = verticalAnchor === "below" ? pageY + height + 4 : pageY - 4;

            setSelectorPosition({ x, y });

            if (!isControlled) {
                setInternalVisible(true);
            }
        });
    }, [horizontalAnchor, verticalAnchor, modalWidth, isControlled]);

    const handleClose = useCallback(() => {
        if (!isControlled) {
            setInternalVisible(false);
        }
        onClose?.();
    }, [isControlled, onClose]);

    const transformOrigin = verticalAnchor === "below"
        ? (horizontalAnchor === "right" ? "top right" : "top left")
        : (horizontalAnchor === "right" ? "bottom right" : "bottom left");

    return (
        <>
            <View ref={triggerRef} collapsable={false}>
                {trigger(handleOpen)}
            </View>

            <Modal
                visible={modalRendered}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.container,
                                    {
                                        position: "absolute",
                                        left: selectorPosition.x,
                                        top: selectorPosition.y,
                                        width: modalWidth,
                                        maxHeight: modalMaxHeight,
                                    },
                                    Platform.OS === "web" && { transformOrigin },
                                    animatedStyle,
                                    modalStyle,
                                ]}
                            >
                                {children}
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.15)",
    },
    container: {
        backgroundColor: CREAM,
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
});
