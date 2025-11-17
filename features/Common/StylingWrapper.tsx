import { CREAM } from '@/styles/styles';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
const safePadding = Platform.OS === 'ios' ? 60 : 10;

interface StylingWrapperProps {
  children: React.ReactElement; // Or JSX.Element
}


export const FullScreenStylingWrapper: React.FC<StylingWrapperProps> = ({children}) => {

    return (
        <View style={styles.container}>
           {children}
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CREAM, 
    paddingTop: safePadding,
    
  },
});
