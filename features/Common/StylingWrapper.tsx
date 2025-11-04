import { CREAM } from '@/styles/styles';
import { Platform, StyleSheet, View } from 'react-native';
const safePadding = Platform.OS === 'ios' ? 60 : 10;


export default function FullScreenStylingWrapper({children}){

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
