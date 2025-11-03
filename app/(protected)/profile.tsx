import FullScreenStylingWrapper from '@/features/Common/StylingWrapper';
import Profile from '@/features/Profile/Profile';
import { StyleSheet, View } from 'react-native';

export default function FriendChats(){
    return (
        <View style={styles.container}>
          <FullScreenStylingWrapper>
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
