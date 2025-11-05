import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export default function UserDataInput({onChangeEmail, onChangePassword, onChangeName, onChangePhoneNumber, showName, showPhoneNumber}) {
    return (
            <View style={styles.container}>
                {
                    showPhoneNumber &&
                    <PhoneNumberInput
                    onDataChange={setPhoneNumber}
                    phoneNumber={phoneNumber}
                />
                }
                {showName &&
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
        padding: 10,
        backgroundColor: 'lightblue',
        //alignItems: 'center',
        borderRadius: 3,
        //margin: 10,
    },
    textInput: {
        // borderRadius: 3,
        // margin: 10,
        // padding: 10,
        // backgroundColor: LIGHT_GREEN,
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


