import { BRIGHT_BLUE, CREAM } from '@/styles/styles';
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    textInput: {
        borderRadius: 10,
        padding: 10,
        backgroundColor: BRIGHT_BLUE,
        width: 200,
        color: CREAM,
        fontWeight: 800,
        flexGrow: 1,
    },

});

