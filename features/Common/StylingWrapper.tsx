import { CREAM } from '@/styles/styles';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
const safePadding = Platform.OS === 'ios' ? 45 : 10;

interface StylingWrapperProps {
  children: React.ReactElement; // Or JSX.Element
}


export const FullScreenStylingWrapper: React.FC<StylingWrapperProps> = ({children}) => {

    return (
        <View style={styles.container}>
          <View style={styles.padding}/>
           {children}
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: CREAM,
    //alignItems: 'center',

    //paddingTop: safePadding,
  },
  padding: {
    minHeight: safePadding,
    //paddingVertical: safePadding,
    zIndex: 100, // Sit above the scrolling TodayList
    //position: 'relative', // Create stacking context
    backgroundColor: CREAM, // Opaque background to hide content underneath

  },
});
