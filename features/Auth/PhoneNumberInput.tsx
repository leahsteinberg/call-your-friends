import React from 'react';
import { StyleSheet } from 'react-native';

import { TextInput, View } from 'react-native';


export default function PhoneNumberInput({onDataChange, phoneNumber}) {
    return (
        <View style={styles.container}>
            <View
            style={styles.component}>
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
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
    component: {
    padding: 10,
    backgroundColor: 'lightblue',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
    textInput:{
        borderRadius: '18',
    },
});

