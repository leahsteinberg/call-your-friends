import { Counter } from '@/features/counter/Counter';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';


export default function HomeScreen() {

    console.log(store);
  return (
    <Provider store={store}>
    <View style={styles.container}>
      <Counter/>
    </View>
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
