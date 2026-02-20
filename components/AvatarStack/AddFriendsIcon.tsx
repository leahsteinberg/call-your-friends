import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM, PALE_BLUE } from "@/styles/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const CIRCLE_SIZE = 22;
const OVERLAP = -15;

export default function AddFriendsIcon(): React.JSX.Element {
    return (
        <View style={styles.container}>
            {/* Back circle */}
            <View style={[styles.circle, { zIndex: 1 }]} />
            {/* Middle circle */}
            <View style={[styles.circle, { zIndex: 2, marginLeft: OVERLAP }]} />
            {/* Front circle with + */}
            <View style={[styles.circle, styles.frontCircle, { zIndex: 3, marginLeft: OVERLAP }]}>
                <Text style={styles.plus}>+</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: PALE_BLUE,
        borderWidth: 1.5,
        borderColor: CORNFLOWER_BLUE,
    },
    frontCircle: {
        backgroundColor: CREAM,
        borderColor: CORNFLOWER_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plus: {
        fontSize: 13,
        fontWeight: '700',
        color: CORNFLOWER_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
        marginTop: -1,
    },
});
