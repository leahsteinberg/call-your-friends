import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export default function UserEmailPasswordInput({onChangeEmail, onChangePassword}) {
    return (
            <View style={styles.container}>
                <TextInput
                    placeholder="Email address"
                    style={styles.textInput}
                    onChangeText={(text)=> onChangeEmail(text)}
                />
                <TextInput
                    placeholder="Password"
                    style={styles.textInput}
                    onChangeText={(text)=> onChangePassword(text)}
                    secureTextEntry
                />
            </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 3,
        //margin: 10,
    },
    textInput: {
        borderRadius: 10,
        marginVertical: 10,
        padding: 10,
        backgroundColor: CREAM,
        width: 200,
        color: BRIGHT_BLUE,
        fontWeight: 800,
        flexGrow: 1,
        borderWidth: 3,
        borderColor: BRIGHT_GREEN,
    },
});


