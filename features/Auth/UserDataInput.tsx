import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhoneNumberInput from './PhoneNumberInput';


export default function UserDataInput({onChangeName, onChangePhoneNumber, showName, phoneNumber, showPhoneNumber}) {
    return (
        <View style={styles.container}>
            { showName &&
                <TextInput
                    placeholder="Your Name"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.textInput}
                    onChangeText={(text)=> onChangeName(text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                />
            }
            { showPhoneNumber &&
                <View style={styles.phoneInput}>
                    <PhoneNumberInput
                        onDataChange={onChangePhoneNumber}
                        phoneNumber={phoneNumber}
                    />
                </View>
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        gap: 12,
        marginBottom: 12,
    },
    phoneInput: {
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


