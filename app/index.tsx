import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import LogIn from './login';
import { store } from './store';


export default function HomeScreen() {
  return (
    <Provider store={store}>
      <LogIn/>
      <Link href={'/register'} asChild>
        <Button title="register"/>
      </Link>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
