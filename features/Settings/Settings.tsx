import { CustomFonts } from "@/constants/theme";
import { CREAM, DARK_GREEN, ORANGE } from "@/styles/styles";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MeetingCreator from "../Meetings/MeetingCreator";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height

export default function Settings(): React.JSX.Element {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerTranslateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const fabRotation = useRef(new Animated.Value(0)).current;

    const openDrawer = () => {
        setIsDrawerOpen(true);
        Animated.parallel([
            Animated.spring(drawerTranslateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(fabRotation, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
        ]).start();
    };

    const closeDrawer = () => {
        Animated.parallel([
            Animated.spring(drawerTranslateY, {
                toValue: DRAWER_HEIGHT,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(fabRotation, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
        ]).start(() => {
            setIsDrawerOpen(false);
        });
    };

    const toggleDrawer = () => {
        if (isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    };

    const rotation = fabRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            {/* FAB Button */}
            <Animated.View
                style={[
                    styles.fab,
                    {
                        transform: [{ rotate: rotation }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.fabTouchable}
                    onPress={toggleDrawer}
                    activeOpacity={0.7}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Backdrop */}
            {isDrawerOpen && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={closeDrawer}
                >
                    <Animated.View
                        style={[
                            styles.backdrop,
                            { opacity: backdropOpacity }
                        ]}
                    />
                </Pressable>
            )}

            {/* Drawer */}
            {isDrawerOpen && (
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            transform: [{ translateY: drawerTranslateY }]
                        }
                    ]}
                >
                    <Pressable onPress={(e) => e.stopPropagation()} style={styles.drawerContent}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        <MeetingCreator onSuccess={closeDrawer} />
                    </Pressable>
                </Animated.View>
            )}
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1001,
    },
    fabTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabText: {
        color: CREAM,
        fontSize: 32,
        fontWeight: '300',
        lineHeight: 32,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    },
    drawer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: DRAWER_HEIGHT,
        backgroundColor: CREAM,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 1000,
    },
    drawerContent: {
        flex: 1,
        paddingTop: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 8,
    },
});
