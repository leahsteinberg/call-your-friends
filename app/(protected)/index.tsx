import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import Profile from '@/features/Profile/Profile';
import { StyleSheet, View } from 'react-native';

export default function Index(){
    return (
        <View style={styles.container}>
          <FullScreenStylingWrapper showGradientBackground>
            <Profile/>
          </FullScreenStylingWrapper>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
