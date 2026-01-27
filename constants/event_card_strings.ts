interface EventCardStrings {
    nameText?: (...args: any[]) => string;
    mainText?: (...args: any[]) => string;
    subtext?: (...args: any[]) => string | undefined;
    timeText?: (...args: any[]) => string;
    acceptButtonText?: () => string;
    rejectButtonText?: () => string;
    // Legacy support - will be migrated to mainText
    title?: (...args: any[]) => string;
}

export const eventCardText: Record<string, EventCardStrings> = {
    // DRAFT SUGGESTIONS
    draft_suggestion: {
        nameText: (userName: string) => userName || 'someone',
        mainText: (userName: string, timeDiff: string) =>
            `Just a suggestion: Talk with ${userName} ${timeDiff}? We'll see if they're free.`,
        acceptButtonText: () => 'Accept',
        rejectButtonText: () => 'Dismiss',
    },

    broadcast_self_open: {
        nameText: () => '',
        mainText: (userName?: string) => userName ? `Sharing with ${userName} that you're free to talk` : `Sharing that you're free to talk`,
        subtext: (userName?: string) => userName ? `${userName} has claimed the broadcast.` : undefined,
        acceptButtonText: () => 'End',
        // Legacy support
        title: (userName?: string) => `We told ${userName} they can call you now.`,
    },
    broadcast_now_card: {
        mainText: () => `Talk with friends now`,
        subtext: (userName?: string) => userName ? `${userName} has claimed the broadcast.` : undefined,
        acceptButtonText: () => 'Start',
        // Legacy support
        title: () => `Tap to share that you're free for calls.`,
    },

    // OFFERS
    open_offer: {
        nameText: (userName: string, timeDiff: string) => `${userName} wants to talk ${timeDiff}` || 'Unknown',
        mainText: (userName: string, timeDiff: string) => `Let her know if you're free.`,
        acceptButtonText: () => 'Accept',
        rejectButtonText: () => 'Reject',
        // Legacy support
        title: (userName: string) => `Talk to ${userName} `,
    },
    expired_offer: {
        nameText: (userName: string) => userName || 'Unknown',
        mainText: (userName: string) => `Expired offer from ${userName}`,
        // Legacy support
        title: (userName: string) => `Expired Offer from ${userName}`,
    },
    meeting_self_open: {
        title: (displayTime: string) => `Finding someone for a call`,
    },
    meeting_self_accepted: {
        title: (userName: string) => `Talk with ${userName} `,
    },
    meeting_self_rejected: {
        title: () => `We couldn't find someone to accept your meeting.`,
    },
    meeting_self_expired: {
        title: () => `Your meeting expired.`,
    },
    meeting_self_completed: {
        title: (userName: string) => `Your meeting with ${userName} has been completed.`,
    },
    meeting_other_accepted: {
        title: (userName: string) => `Your meeting created by ${userName} is scheduled.`,
    },
    meeting_other_rejected: {
        title: (userName: string) => `Your meeting created by ${userName} was rejected by you.`,
    },
    meeting_other_cancelled: {
        title: (userName: string) => `Your meeting created by ${userName} was cancelled by you.`,
    },

    broadcast_self_pending: {
        title: (userName: string) => `Your broadcast is pending by  ${userName}. `,
    },
    broadcast_self_accepted: {
        nameText: () => '',
        mainText: (userName?: string) => userName ? `${userName} has claimed your open call.` : undefined,
        acceptButtonText: () => 'End',
        title: () => `They've been invited to call`,
    },
    broadcast_self_cancelled: {
        title: () => `Your broadcast was cancelled by you.`,
    },
    broadcast_self_expired: {
        title: () => `Your broadcast created by you expired.`,
    },
    broadcast_other_open: {
        nameText: (userName: string) => `${userName}`,
        mainText: (userName: string) => `Free to talk.`,
        acceptButtonText: () => 'Call',
        rejectButtonText: () => 'Reject',
        hint: (userName: string) => `Tap to call ${userName}.`,
        // Legacy support
        title: (userName: string) => `Call ${userName}.`,
    },
    broadcast_other_accepted: {
        title: (userName: string) => `The broadcast created by ${userName} was accepted by you.`,
    },
    broadcast_other_pending: {
        title: (userName: string) => `The broadcast created by ${userName} is pending by you.`,
    },
    broadcast_other_rejected: {
        title: (userName: string) => `The broadcast created by ${userName} was rejected by you.`,
    },
    broadcast_other_cancelled: {
        title: (userName: string) => `The broadcast created by ${userName} was cancelled by you.`,
    },
    broadcast_other_expired: {
        title: (userName: string) => `The broadcast created by ${userName} was expired by you.`,
    },
    broadcast_other_claimed: {
        nameText: (userName: string) => userName,
        mainText: () => "You're on a call right now",
        acceptButtonText: () => 'Unclaim Call',
    },
};