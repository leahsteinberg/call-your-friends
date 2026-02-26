import { CustomFonts } from "@/constants/theme";
import { clearAuth } from "@/features/Auth/authSlice";
import { usePostSignOutMutation } from "@/services/authApi";
import { APP_BACKGROUND_COLOR, APP_HEADER_TEXT_COLOR, CORNFLOWER_BLUE } from "@/styles/styles";
import { RootState } from "@/types";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import AvatarPicker from "./AvatarPicker";
import UserSignalSettings from "./UserSignalSettings";

export default function Settings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const [signOut] = usePostSignOutMutation();

    const handleSignOut = async () => {
        try {
            await signOut({}).unwrap();
            dispatch(clearAuth());
            router.replace('/login');
        } catch (error) {
            console.error("Sign out error:", error);
            dispatch(clearAuth());
            router.replace('/login');
        }
    };

    return (
        <View style={styles.container}>
                            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
                <AvatarPicker />
                {/* <Text style={styles.title}>Settings</Text> */}
                <Text style={styles.signalsTitle}>Share so Call Your Friends can help you connect</Text>
                <UserSignalSettings/>

            </ScrollView>
            {/* <AddMeetingsButton/> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: APP_BACKGROUND_COLOR,
        //padding: 10,
    },
    title: {
        color: APP_HEADER_TEXT_COLOR,
        marginHorizontal: 15,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 50,
        fontWeight: '600',
    },
    signalsTitle: {
        color: APP_HEADER_TEXT_COLOR,
        marginHorizontal: 15,
        fontFamily: CustomFonts.ztnaturemedium,
        fontSize: 20,
        fontWeight: '600',

    },
    signOutButton: {
        // paddingVertical: 8,
        paddingHorizontal: 8,
        marginHorizontal: 15,
        marginTop: 20,
    },
    signOutText: {
        fontSize: 16,
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        textDecorationLine: 'underline',
    },
});
