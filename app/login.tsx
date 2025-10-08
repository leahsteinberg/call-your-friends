import { AuthComponent } from '@/features/Auth/AuthComponent';
import React from 'react';
import { StyleSheet, View } from 'react-native';


export default function LogIn() {
    return (
        <View style={styles.container}>
            <AuthComponent/>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
  },
});

