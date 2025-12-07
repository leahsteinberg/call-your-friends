import { CustomFonts } from '@/constants/theme';
import { usePostPhoneSignupMutation } from '@/services/authApi';
import { BURGUNDY } from '@/styles/styles';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLogInCredentials } from './authSlice';
import EntryButton from './EntryButton';
import UserDataInput from './UserDataInput';
import UserEmailPasswordInput from './UserEmailPasswordInput';

export function SignUp()  {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const dispatch = useDispatch();
    const [phoneSignUpUser, phoneSignUpStatus] = usePostPhoneSignupMutation();
    
    const handleAuthQuery = async (e: any, authQuery: any) => {
        const result = await authQuery({email, password, phoneNumber, name}).unwrap();
        if (result) {
            dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in / signing in")
        }
    }
    
    const isSignupButtonDisabled = () => !(
        email.length > 0
        && password.length > 0
        && name.length > 0
        && phoneNumber.length === 10
    );
    

    return (
        <View style={styles.container}>
            <Text style={[styles.title]}>
                Call Your Friends
            </Text>
            <View style={styles.component}>
                <UserDataInput
                    onChangeName={(text: string) => setName(text)}
                    onChangePhoneNumber={setPhoneNumber}
                    phoneNumber={phoneNumber}
                    showName={true}
                    showPhoneNumber={true}
                />
                <UserEmailPasswordInput
                    onChangeEmail={(text: string)=> setEmail(text)}
                    onChangePassword={(text: string) => setPassword(text)}
                />
            </View>

                {/* TO DO - LINK TO SIGN IN PAGE!!!*/}
                <EntryButton
                    title="Sign Up"
                    onPressQuery={(e: any) => handleAuthQuery(e, phoneSignUpUser)}
                    isDisabled={isSignupButtonDisabled()}
                />
                
</View>);
}


 const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 40,
        color: BURGUNDY,
        textAlign: 'center',
        margin: 20,
        fontWeight: 'bold',
        fontFamily: CustomFonts.ztnaturebold,
    },
    component: {
        margin: 20,
    }
});
