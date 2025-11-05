import { BRIGHT_BLUE, CLOUDY_SKY_COLOR, CREAM } from "@/styles/styles";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EntryButton({title, onPressQuery, isDisabled}) {

    return (
        <View style={{...styles.button, backgroundColor: isDisabled ? CLOUDY_SKY_COLOR : BRIGHT_BLUE}}>
            <TouchableOpacity
                onPress={onPressQuery}
            >
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: BRIGHT_BLUE,
        // paddingTop: 15,
        // paddingBottom: 15,
        // paddingLeft: 10,
        // paddingRight: 10,
        padding: 10,
        margin: 10,
        borderRadius: 3,
        justifyContent: 'center',
    },
    text: {
        // color: 'white',
        color: CREAM,
        fontWeight: 900,
        textAlign: 'center',

    },
    buttonContainer: {
    },
});
