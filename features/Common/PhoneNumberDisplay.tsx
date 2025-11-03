import { MID_BLUE } from '@/styles/styles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatPhoneNumber } from '../Contacts/contactsUtils';

export default function PhoneNumberDisplay({digits}){
    return (
        <View style={styles.container}>
            <TouchableOpacity >
                <Text style={styles.text}>call them at: </Text>
                <Text style={styles.number}>{formatPhoneNumber(digits)}</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    //justifyContent: 'center',
   // backgroundColor: CREAM,
    borderRadius: 10,
    padding: 4,

    alignItems: 'end',
  },
  text: {
    color: MID_BLUE,

  },
  number: {
    color: MID_BLUE,
    fontWeight: 900,

  }
});
