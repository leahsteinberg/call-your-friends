import { Text, View } from "react-native";

export default function ContactEntry(props) {
    console.log("propsss", props);
  return (<View>
    <Text>Entry for {props.contact.firstName} {props.contact.lastName}</Text>
  </View>);
}