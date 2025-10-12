import { LIGHT_GREEN } from '@/styles/styles';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export default function UserDataInput({onChangeEmail, onChangePassword, onChangeName, showName}) {
    return (
            <View style={styles.component}>
                {showName &&
                    <TextInput
                        placeholder="Your Name"
                        style={styles.textInput}
                        onChangeText={(text)=> onChangeName(text)}
                    />
                }
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
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',

  },
  component: {
    padding: 10,
    backgroundColor: 'lightblue',
    //alignItems: 'center',
    borderRadius: 3,
    margin: 10,
  },
    textInput:{
        borderRadius: 3,
        margin: 10,
        padding: 10,
        backgroundColor: LIGHT_GREEN,
    },
});
