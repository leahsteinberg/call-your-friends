import { meetingApi } from "@/services/meetingApi";
import { usePostRegisterPushMutation } from "@/services/notificationApi";
import { configureNotificationHandler, registerForPushNotificationsAsync, setupNotificationListeners } from "@/services/notificationsService";
import { offerApi } from "@/services/offersApi";
import { NOTIFICATION_SCREENS, PushPayload } from "@/types/pushNotification";
import { RootState } from "@/types/redux";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export function usePushNotifications() {
    const dispatch = useDispatch();
    const router = useRouter();
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [postRegisterPushToken] = usePostRegisterPushMutation();

    // Invalidate caches to refresh data
    const invalidateCaches = () => {
        dispatch(offerApi.util.invalidateTags(['Offer']));
        dispatch(meetingApi.util.invalidateTags(['Meeting']));
    };

    // Handle navigation based on notification screen
    const handleNavigate = (payload: PushPayload) => {
        console.log("handleNavigate", payload);

        if (!payload.screen) {
            return;
        }

        const route = NOTIFICATION_SCREENS[payload.screen] || `/(protected)`;

        // Navigate with params from payload data
        router.push({
            pathname: route as any,
            params: payload.data,
        });
    };

    // Handle notification response (when user taps notification)
    const handleNotificationResponse = (payload: PushPayload | undefined) => {
        console.log("handle notification response, ", payload);
        if (!payload) {
            // Legacy notification without new payload structure - just refresh
            invalidateCaches();
            return;
        }

        switch (payload.action) {
            case 'navigate':
                handleNavigate(payload);
                invalidateCaches();

                break;

            case 'refresh':
                invalidateCaches();
                break;

            case 'silent':
                // Background update, no action needed
                break;

            default:
                // Fallback: refresh data
                invalidateCaches();
        }
    };

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
                const payload = notification.request.content.data as PushPayload | undefined;

                // Always refresh data when notification is received in foreground
                if (payload?.type) {
                    invalidateCaches();
                }
            },
            (response) => {
                console.log('Notification response:', response);
                const payload = response.notification.request.content.data as PushPayload | undefined;
                handleNotificationResponse(payload);
            }
        );

        return cleanup;
    }, [userId]);

    return { expoPushToken };
}
