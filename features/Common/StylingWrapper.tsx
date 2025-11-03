import { CREAM } from '@/styles/styles';
import { StyleSheet, View } from 'react-native';

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
  },
});
