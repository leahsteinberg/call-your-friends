import { CustomFonts } from "@/constants/theme";
import { APP_BACKGROUND_COLOR, APP_HEADER_TEXT_COLOR } from "@/styles/styles";
import { RootState } from "@/types";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import UserSignalSettings from "./UserSignalSettings";

export default function Settings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
                {/* <Text style={styles.title}>Settings</Text> */}
                <Text style={styles.signalsTitle}>Share so Loyal can help you connect</Text>
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
});
