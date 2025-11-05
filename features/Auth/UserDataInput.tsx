import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhoneNumberInput from './PhoneNumberInput';


export default function UserDataInput({onChangeName, onChangePhoneNumber, showName, phoneNumber, showPhoneNumber}) {
    return (
        <View style={styles.container}>
            { showPhoneNumber &&
            <View style={styles.phoneInput}>
                <PhoneNumberInput
                    onDataChange={onChangePhoneNumber}
                    phoneNumber={phoneNumber}
                />
                </View>
            }
            { showName &&
                <TextInput
                    placeholder="Your Name"
                    style={styles.textInput}
                    onChangeText={(text)=> onChangeName(text)}
                />
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        borderRadius: 3,
        flex: 1,
    },
    phoneInput: {
        flex: 1,
    },
    textInput: {
        flex: 1,
        borderRadius: 10,
        marginVertical: 10,
        padding: 5,
        backgroundColor: CREAM,
        width: 200,
        color: BRIGHT_BLUE,
        fontWeight: 800,
        flexGrow: 1,
        borderWidth: 3,
        borderColor: BRIGHT_GREEN,
    },
});


