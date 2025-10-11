import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';


export default function UserDataInput({onDataChangeEmail, onDataChangePassword, onDataChangeName, showName}) {
    return (
        <View style={styles.container}>
            <View style={styles.component}>
                {showName &&
                    <TextInput
                        placeholder="Your Name"
                        style={styles.textInput}
                        onChangeText={(text)=> onDataChangeName(text)}
                    />
                }
                <TextInput
                    placeholder="Email address"
                    style={styles.textInput}
                    onChangeText={(text)=> onDataChangeEmail(text)}
                />
                <TextInput
                    placeholder="Password"
                    style={styles.textInput}
                    onChangeText={(text)=> onDataChangePassword(text)}
                    secureTextEntry
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
