import { useState } from 'react';
import { Button, Modal, View } from 'react-native';
import ContactsComponent from './ContactsComponent';

export default function ContactsModal(){
        const [modalVisible, setModalVisible] = useState(false);

    return (
        <View>
            <Button
                title='This is the contacts modal button'
                onPress={() => setModalVisible(true)}
            />
            <Modal visible={modalVisible}>
                <ContactsComponent/>
            </Modal>
        </View>
    )
}