import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM, ORANGE } from "@/styles/styles";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function EntryButton({title, onPressQuery, isDisabled}) {

    return (
        <TouchableOpacity
            onPress={onPressQuery}
            disabled={isDisabled}
            style={[
                styles.button,
                isDisabled && styles.buttonDisabled
            ]}
            activeOpacity={0.8}
        >
            <Text style={[styles.text, isDisabled && styles.textDisabled]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: ORANGE,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#d0d0d0',
        shadowOpacity: 0.1,
    },
    text: {
        color: CREAM,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: CustomFonts.ztnaturebold,
    },
    textDisabled: {
        color: CORNFLOWER_BLUE,
        opacity: 0.5,
    },
});
