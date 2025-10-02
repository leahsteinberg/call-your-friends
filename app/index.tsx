import React from 'react';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import LogIn from './login';
import { store } from './store';


export default function HomeScreen() {
  return (
    <Provider store={store}>
      <LogIn/>
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
