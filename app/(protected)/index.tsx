import ContactsModal from '@/features/Contacts/ContactsModal';
import { StyleSheet, Text, View } from 'react-native';

export default function Index(){


    return (
        <View style={styles.container}>
            <Text>This is the Index/Home page!</Text>
            <ContactsModal/>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});