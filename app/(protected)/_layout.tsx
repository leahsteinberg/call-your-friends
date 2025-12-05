import FlowerBlob from "@/assets/images/flower-blob.svg";
import StarPerson from "@/assets/images/star-person.svg";
import { CustomFonts } from "@/constants/theme";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BRIGHT_BLUE, CREAM, DARK_GREEN, PALE_BLUE } from "@/styles/styles";
import { Tabs } from "expo-router";
import { Sticker } from "lucide-react-native";
import { StyleSheet } from "react-native";
const ICON_SIZE = 33;

const Layout = () => {
    usePushNotifications();



    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: BRIGHT_BLUE,
            tabBarInactiveTintColor: DARK_GREEN,
            tabBarStyle: {
              backgroundColor: CREAM,
              borderTopColor: PALE_BLUE,
              borderTopWidth: 5,
              height: 90,
            },
            tabBarLabelStyle: {
                paddingTop: 10,
                fontSize: 15,
                fontFamily: CustomFonts.ztnaturebold,
            },
            headerShown: false,
          }}
        >
            <Tabs.Screen
                name="friendchats"
                options={{
                    headerShown: false,
                    title: "PLAN",
                    tabBarIcon: ({ color }) => <StarPerson
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        fill={color}
                    />,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "TODAY",
                    tabBarIcon: ({ color }) => <FlowerBlob
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    fill={color}
                />,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                options={{
                    title: 'Home',
                    tabBarLabel: 'ME',
                    tabBarIcon: ({ color }) => <Sticker  color={color} size={ICON_SIZE}/>, // Custom icon component
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                  }}
                name="index"
            />
  



        </Tabs>
    );
};


const styles = StyleSheet.create({


});

export default Layout;