import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM, ORANGE } from "@/styles/styles";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EntryButton({title, onPressQuery, isDisabled, isLoading}: {title: string, onPressQuery: (e: any) => void, isDisabled: boolean, isLoading?: boolean}) {

    return (
        <TouchableOpacity
            onPress={onPressQuery}
            disabled={isDisabled}
            style={[
                styles.button,
                isDisabled && !isLoading && styles.buttonDisabled,
                isLoading && styles.buttonLoading,
            ]}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                {isLoading && (
                    <ActivityIndicator
                        size="small"
                        color={CREAM}
                        style={styles.spinner}
                    />
                )}
                <Text style={[styles.text, isDisabled && !isLoading && styles.textDisabled]}>
                    {title}
                </Text>
            </View>
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
    buttonLoading: {
        opacity: 0.85,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginRight: 10,
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
