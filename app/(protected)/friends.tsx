import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import ContactsComponent from '@/features/Contacts/ContactsComponent';
import { StyleSheet, View } from 'react-native';

export default function Friends(){

    return (
      <View style={styles.container}>
        <FullScreenStylingWrapper>
          <ContactsComponent/>
        </FullScreenStylingWrapper>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
