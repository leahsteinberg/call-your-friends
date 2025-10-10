import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PhoneNumberValidity from '../Auth/PhoneNumberValidity';


export default function PhoneNumberInput({onPress}) {

    const [phoneNumber, setPhoneNumber] = useState('');
    
    const renderSendInviteButton = () => {
        return (
            <View style={{backgroundColor: 'dodgerblue'}}>
                <TouchableOpacity
                    onPress={(e) => {onPress(e, phoneNumber)}}
                    style={styles.button}
                >
                    <Text style={styles.text}>Invite Friend By Phone Number</Text>
                </TouchableOpacity>
            </View>
            );
    }

    return (
        <View>
            <View>
                <PhoneNumberValidity
                    phoneNumber={phoneNumber}
                />
                <TextInput
                    placeholder="Phone Number"
                    onChangeText={(phoneNumber)=> setPhoneNumber(phoneNumber)}
                    keyboardType={'numeric'}
                    value={phoneNumber}
                />
                {renderSendInviteButton()}
            </View>
            
        </View>
    );
}


const styles = StyleSheet.create({
});

