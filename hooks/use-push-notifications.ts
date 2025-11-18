import { usePostRegisterPushMutation } from "@/services/notificationApi";
import { configureNotificationHandler, registerForPushNotificationsAsync, setupNotificationListeners } from "@/services/notificationsService";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";

export function usePushNotifications() {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [postRegisterPushToken] = usePostRegisterPushMutation();

    useEffect(() => {
        console.log("usePushNotifications - useEffect");

        if (Platform.OS === 'web') {
            return;
        }

        // Configure notification handler
        configureNotificationHandler();

        // Register for push notifications
        registerForPushNotificationsAsync()
            .then(token => {
                console.log("is there a token??", token);
                if (token) {
                    setExpoPushToken(token);
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    console.log("about to do network call with pushtoken");
                    postRegisterPushToken({ pushToken: token, userId, timezone });
                    console.log('Successfully registered for push notifications:', token);
                }
            })
            .catch((error: any) => {
                console.error('Failed to register for push notifications:', error);
            });

        // Setup notification listeners
        const cleanup = setupNotificationListeners(
            (notification) => {
                console.log('Notification received:', notification);
            },
            (response) => {
                console.log('Notification response:', response);
            }
        );

        return cleanup;
    }, [userId]);

    return { expoPushToken };
}
