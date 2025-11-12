import FullScreenStylingWrapper from '@/features/Common/StylingWrapper';
import Meetings from '@/features/Meetings/Meetings';
import { StyleSheet, View } from 'react-native';

export default function FriendChats() {


  console.log("in friend chats")
    return (
        <View style={styles.container}>
            <FullScreenStylingWrapper>
              <Meetings/>
            </FullScreenStylingWrapper>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: CLOUDY_SKY_COLOR,
  },
});
