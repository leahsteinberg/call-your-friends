import { usePostSignOutMutation } from "@/services/authApi";
import React from "react";
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../types/redux";
import { handleAuthQuery } from "../Auth/authUtils";
import EntryButton from "../Auth/EntryButton";
import HealthKitData from "../StepTime/HealthKitData";

const safePadding = Platform.OS === 'ios' ? 60 : 0;


export default function Profile(): React.JSX.Element {
    const dispatch = useDispatch();
    const [signOutUser] = usePostSignOutMutation();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);


    return (
        <View style={styles.container}>
            <EntryButton
                title="Sign Out -- DOES NOT WORK"
                onPressQuery={(e) => {handleAuthQuery(e, signOutUser)}}
            />
                {/* <StepTimes /> */}
                {Platform.OS === 'ios' &&
                    <HealthKitData/>
                }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,

        maxHeight: '100%',
        maxWidth: '100%',
        width: '100%',
        
        justifyContent: 'space-between',
        // overflow: 'scroll',
        flex: 1,
    },
    component: {}
});