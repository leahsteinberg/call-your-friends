import { AuthComponent } from '@/features/Auth/AuthComponent';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';


export default function LogIn() {

    const {height, width, scale, fontScale} = useWindowDimensions();
    console.log({height, width, scale, fontScale})

    return (
        <View style={{...styles.container}}>
            <AuthComponent/>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignContent: 'center',
    backgroundColor: 'green',
    //justifyContent: 'center'
  },
  component: {
    // backgroundColor: 'green',
    // marginVertical: 10,
    // justifyContent: 'center',
    // alignItems: 'center',
  
  }
});

