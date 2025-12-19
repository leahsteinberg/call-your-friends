import { CustomFonts } from "@/constants/theme";
import { APP_BACKGROUND_COLOR, APP_HEADER_TEXT_COLOR } from "@/styles/styles";
import { RootState } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import AddMeetingsButton from "./AddMeetingsButton";
import UserSignalSettings from "./UserSignalSettings";

export default function Settings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <UserSignalSettings/>
            <AddMeetingsButton/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: APP_BACKGROUND_COLOR,
        padding: 10,
    },
    title: {
        color: APP_HEADER_TEXT_COLOR,
        marginHorizontal: 15,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 50,
        fontWeight: '600',
    },
});
