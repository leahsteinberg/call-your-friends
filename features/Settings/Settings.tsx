import { CustomFonts } from "@/constants/theme";
import { CREAM, DARK_GREEN, ORANGE } from "@/styles/styles";
import React, { useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MeetingCreator from "../Meetings/MeetingCreator";

export default function Settings(): React.JSX.Element {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const openModal = () => {
        setIsModalVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            {/* FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={openModal}
                activeOpacity={0.7}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Modal for MeetingCreator */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={closeModal}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <MeetingCreator onSuccess={closeModal} />
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: ORANGE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    fabText: {
        color: CREAM,
        fontSize: 32,
        fontWeight: '300',
        lineHeight: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 500,
    },
});
