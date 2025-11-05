import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhoneNumberValidity from './PhoneNumberValidity';


export default function PhoneNumberInput({onDataChange, phoneNumber}) {
    return (
        <View
            style={styles.container}
        >
            <View >
                <TextInput
                    placeholder="Enter Phone Number"
                    style={styles.textInput}
                    onChangeText={(text)=> onDataChange(text)}
                    keyboardType={'numeric'}
                    value={phoneNumber}
                    maxLength={10}
                />
            </View>
            <View >
                <PhoneNumberValidity phoneNumber={phoneNumber}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textInput: {
        borderRadius: 10,
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

