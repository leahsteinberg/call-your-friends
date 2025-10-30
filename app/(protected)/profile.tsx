import Profile from '@/features/Profile/Profile';
import { StyleSheet, View } from 'react-native';

export default function FriendChats(){
    return (
        <View style={styles.container}>
            <Profile/>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
  },
});
