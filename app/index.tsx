import React from 'react';
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


