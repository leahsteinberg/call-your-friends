export type PushNotificationType =
    | 'OFFER_CREATED'
    | 'OFFER_ACCEPTED'
    | 'CALL_INTENT_CREATED'
    | 'BROADCAST_STARTED'
    | 'BROADCAST_ENDED';

export type PushNotificationAction = 'navigate' | 'refresh' | 'silent';

export interface PushPayload {
    type: PushNotificationType;
    action: PushNotificationAction;
    screen?: string;
    data: Record<string, any>;
}

// Screen name mapping for navigation
export const NOTIFICATION_SCREENS: Record<string, string> = {
    Home: '/(protected)',
    OfferDetail: '/(protected)/offer',
    MeetingDetail: '/(protected)/meeting',
    Suggestions: '/(protected)/suggestions',
};
