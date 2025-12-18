import { CustomFonts } from "@/constants/theme";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import UserSignalSettings from "../SignalCards/UserSignalSettings";
import AddMeetingsButton from "./AddMeetingsButton";

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
        backgroundColor: CREAM,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
});
