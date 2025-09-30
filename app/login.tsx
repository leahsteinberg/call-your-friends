import { AuthComponent } from '@/features/Auth/AuthComponent';
import React from 'react';
import { StyleSheet } from 'react-native';

import { View } from 'react-native';


export default function LogIn() {
    return (
        <View style={styles.container}>
            <View
            style={styles.component}
            >
            <AuthComponent  
            />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  component: {
    padding: 20,
    backgroundColor: 'lightblue',
    alignSelf: 'stretch',
    alignItems: 'center',
  }
});