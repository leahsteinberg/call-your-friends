import ContactsComponent from '@/features/Contacts/ContactsComponent';
import { StyleSheet, View } from 'react-native';

export default function Index(){
  console.log("in Protected index")


    return (
      <View style={styles.container}>
        {/* <Text>This is the Index/Home page!</Text> */}
        <ContactsComponent/>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    // height
  },
});