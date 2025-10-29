import ContactsComponent from '@/features/Contacts/ContactsComponent';
import { StyleSheet, View } from 'react-native';

export default function Index(){

    return (
      <View style={styles.container}>
        <ContactsComponent/>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'lightblue',
    // // height
  },
});