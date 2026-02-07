import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import CaptureGradients from '@/scripts/CaptureGradients';
import { StyleSheet, View } from 'react-native';

export default function Index(){
    return (
        <View style={styles.container}>
          <FullScreenStylingWrapper showGradientBackground>
           <CaptureGradients/>
            {/* <Profile/> */}
          </FullScreenStylingWrapper>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
