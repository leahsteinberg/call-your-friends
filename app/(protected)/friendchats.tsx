import FullScreenStylingWrapper from '@/features/Common/StylingWrapper';
import Meetings from '@/features/Meetings/Meetings';
import { StyleSheet, View } from 'react-native';


// import * as Notifications from 'expo-notifications';

export default function FriendChats() {


//   useEffect(() => {
//     async function getPushToken() {
//       console.log("in get push token")
//         const { data: token } = await Notifications.getExpoPushTokenAsync({
//           projectId: '7a8ce9d1-3bae-4540-a78c-da592a1f971e', // Replace with your actual projectId
//         });
//         console.log("my token is =",token);
//         return token;
//       }
//       getPushToken()
// },[])

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
