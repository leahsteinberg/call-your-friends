import { SignUp } from '@/features/Auth/SignUp';
import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import React from 'react';
import { StyleSheet } from 'react-native';



export default function LogIn() {


    return (
        <FullScreenStylingWrapper>
            <SignUp/>
        </FullScreenStylingWrapper>
    );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   // alignContent: 'center',
  //   backgroundColor: 'green',
  //   //justifyContent: 'center'
  // },
  component: {
    // backgroundColor: 'green',
    // marginVertical: 10,
    // justifyContent: 'center',
    // alignItems: 'center',
  
  }
});

