import { CustomFonts } from '@/constants/theme';
import { CORNFLOWER_BLUE, CREAM } from '@/styles/styles';
import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhoneNumberInput, { PhoneNumberInputRef } from './PhoneNumberInput';

interface UserDataInputProps {
    onChangeName: (text: string) => void;
    onChangePhoneNumber: (phone: string) => void;
    showName: boolean;
    phoneNumber: string;
    showPhoneNumber: boolean;
}

export default function UserDataInput({ onChangeName, onChangePhoneNumber, showName, phoneNumber, showPhoneNumber }: UserDataInputProps) {
    const phoneInputRef = useRef<PhoneNumberInputRef>(null);

    return (
        <View style={styles.container}>
            {showName && (
                <TextInput
                    placeholder="Your Name"
                    placeholderTextColor={CORNFLOWER_BLUE + '80'}
                    style={styles.textInput}
                    onChangeText={(text) => onChangeName(text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType={showPhoneNumber ? "next" : "done"}
                    blurOnSubmit={!showPhoneNumber}
                    onSubmitEditing={() => {
                        if (showPhoneNumber) {
                            phoneInputRef.current?.focusFirstInput();
                        }
                    }}
                />
            )}
            {showPhoneNumber && (
                <View style={styles.phoneInput}>
                    <PhoneNumberInput
                        ref={phoneInputRef}
                        onDataChange={onChangePhoneNumber}
                        phoneNumber={phoneNumber}
                    />
                </View>
            )}
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


