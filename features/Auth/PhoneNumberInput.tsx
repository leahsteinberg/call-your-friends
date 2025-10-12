import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhoneNumberValidity from './PhoneNumberValidity';


export default function PhoneNumberInput({onDataChange, phoneNumber}) {
    return (
        <View style={styles.container}>
            <PhoneNumberValidity phoneNumber={phoneNumber}/>
            <View style={styles.component}>
                <TextInput
                    placeholder="Phone Number"
                    style={styles.textInput}
                    onChangeText={(text)=> onDataChange(text)}
                    keyboardType={'numeric'}
                    value={phoneNumber}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    component: {
        padding: 10,
        backgroundColor: 'lightblue',
        alignSelf: 'stretch',
        alignItems: 'center',
        borderRadius: 3,
        margin: 10,
    },
    textInput: {
        borderRadius: '18',
    },
});

