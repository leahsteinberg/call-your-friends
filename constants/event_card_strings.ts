export const eventCardText = {
    open_offer: {
        title: (userName: string) => `Open Offer from ${userName}`,
    },
    expired_offer: {
        title: (userName: string) => `Expired Offer from ${userName}`,
    },
    meeting_self_open: {
        title: () => `Your created meeting is open.`,
    },
    meeting_self_accepted: {
        title: (userName: string) => `${userName} accepted your meeting.`,
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
    broadcast_self_open: {
        title: () => `Your broadcast is open.`,
    },
    broadcast_self_pending: {
        title: (userName: string) => `Your broadcast is pending by  ${userName}. `,
    },
    broadcast_self_accepted: {
        title: (userName: string) => `Your broadcast was accepted by ${userName}.`,
    },
    broadcast_self_cancelled: {
        title: () => `Your broadcast was cancelled by you.`,
    },
    broadcast_self_expired: {
        title: () => `Your broadcast created by you expired.`,
    },
    broadcast_other_open: {
        title: (userName: string) => `Asking for phone calls now. Claim to call.`,
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
} as Record<string, { title: (userName: string) => string }>;