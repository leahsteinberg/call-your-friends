import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import Settings from '@/features/Settings/Settings';
import { StyleSheet, View } from 'react-native';

export default function SettingsPage(){
    return (
        <View style={styles.container}>
          <FullScreenStylingWrapper>
            <Settings/>
          </FullScreenStylingWrapper>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
