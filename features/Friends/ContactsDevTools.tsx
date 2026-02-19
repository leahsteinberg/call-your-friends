import { Text, TouchableOpacity, View } from "react-native";


export const devFakeFriendButton = ({selectContact}) => {
    return (
    <View >
        <TouchableOpacity onPress={() => selectContact(fakeContact)}>
            <Text>Add dev tools fake friend.</Text>
        </TouchableOpacity>
    </View>
    );
}

export const devFakeAcceptInviteButton = ({acceptInvite}) => {
    return (
    <View >
        <TouchableOpacity onPress={() => acceptInvite({token: '54183880-71dc-4b5d-815c-08a7292c4e64', userToPhoneNumber: '+16193015075'})}>
            <Text>Accept Fake invite. Based on existing invite.</Text>
        </TouchableOpacity>
    </View>
    );
    }