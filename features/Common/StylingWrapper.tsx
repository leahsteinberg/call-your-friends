import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
const safePadding = Platform.OS === 'ios' ? 45 : 10;

interface StylingWrapperProps {
  children: React.ReactElement; // Or JSX.Element
  showGradientBackground?: boolean;
}


export const FullScreenStylingWrapper: React.FC<StylingWrapperProps> = ({children, showGradientBackground = false}) => {
  //   if (showGradientBackground) {      
  // return (
  //           <OrganicGradientBackground >
  //               <View style={styles.padding}/>
  //               {children}
  //           </OrganicGradientBackground>
  //       );
  //     }

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
    //backgroundColor: APP_BACKGROUND_COLOR,
  },
  padding: {
    minHeight: safePadding,
    zIndex: 100,
  },
});
