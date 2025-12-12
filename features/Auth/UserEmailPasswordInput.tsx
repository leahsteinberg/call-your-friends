import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export default function UserEmailPasswordInput({onChangeEmail, onChangePassword}) {
    return (
            <View style={styles.container}>
                <TextInput
                    placeholder="Email address"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.textInput}
                    onChangeText={(text)=> onChangeEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.textInput}
                    onChangeText={(text)=> onChangePassword(text)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
    );
}


const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    textInput: {
        borderRadius: 8,
        padding: 14,
        backgroundColor: CREAM,
        color: CORNFLOWER_BLUE,
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
        borderWidth: 2,
        borderColor: 'transparent',
    },
});


