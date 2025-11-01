import { usePostSignOutMutation } from "@/services/authApi";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import EntryButton from "../Auth/EntryButton";
import HealthKitData from "../StepTime/HealthKitData";
import StepTimes from '../StepTime/StepTimes';

const safePadding = Platform.OS === 'ios' ? 60 : 0;


export default function Profile(): React.JSX.Element {
    const { height, width } = useWindowDimensions();
    const dispatch = useDispatch();
    const [signOutUser] = usePostSignOutMutation();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [data, setData] = useState([])


    const handleAuthQuery = async (e: any, authQuery: any) => {
        const result = await authQuery({userId}).unwrap();
        if (result) {
            //dispatch(setLogInCredentials({ token: result.token, user: result.user }))
        } else {
            console.log("error logging in / signing in")
        }
    }


    return (
        <View style={[styles.container, {height: height*.7, width: width*.9}]}>
            <Text>Signout not fully handled on backend, does not work! LOL O LO</Text>
            <EntryButton
                title="Sign Out"
                onPressQuery={(e) => {handleAuthQuery(e, signOutUser)}}
            />

                <StepTimes />
                {Platform.OS === 'ios' &&
                    <HealthKitData/>
                }
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    },
});