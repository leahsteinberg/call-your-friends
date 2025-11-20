import { ProcessedSentInvite, SentInvite } from "../Contacts/types";
import { MeetingType, ProcessedMeetingType } from "./types";

export const processMeetings = async (meetings: MeetingType[]): Promise<ProcessedMeetingType[]> => {
    const meetingsWithDisplayTimePromises = meetings
        .map(async (meeting): Promise<ProcessedMeetingType> =>
            ({
                ...meeting,
                displayScheduledFor: await displayDateTime(meeting.scheduledFor)
            })
        );
    const meetingsWithDisplayTime = await Promise.all(meetingsWithDisplayTimePromises);
    const sortedMeetings = sortByScheduledTime(meetingsWithDisplayTime);

    return sortedMeetings;
};


export const processOffers = async (offers: any[]): Promise<any[]> => {
    console.log("offersssss", offers)
    const offersWithDislayTimePromises = offers
        .map(async (offer): Promise<any> =>
            ({
                ...offer,
                scheduledFor: offer.meeting.scheduledFor,
                displayScheduledFor: await displayDateTime(offer.meeting.scheduledFor),
                displayExpiresAt: await displayTimeUntil(offer.expiresAt),
            })
        )
        const offersWithDisplayTime = await Promise.all(offersWithDislayTimePromises);
        const sortedOffers = sortByScheduledTime(offersWithDisplayTime);
        return sortedOffers;
}

export const processSentInvites = async (sentInvites: SentInvite[]): Promise<ProcessedSentInvite[]> => {
    const invitesWithDisplayTimePromises = sentInvites
        .map(async (invite): Promise<ProcessedSentInvite> =>
            ({
                ...invite,
                displayCreatedAt: await displayDate(invite.createdAt)
            })
        );
    const invitesWithDisplayTime = await Promise.all(invitesWithDisplayTimePromises);
    return invitesWithDisplayTime;
}

export const displayDateTime = async (dateTime: string): Promise<string> => {
    const dateObj = new Date(dateTime);
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
    });
    const displayTimeString = formatter.format(dateObj);
    return displayTimeString;
};

export const displayTimeUntil = async (dateTime: string): Promise<string> => {
    /// if less than a day, return "x hours"
    // if a day or more, return "1 day" or "2 days" up to "x days"
    const targetDate = new Date(dateTime);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    // If already expired
    if (diffMs <= 0) {
        return 'expired';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
        return diffDays === 1 ? '1 day' : `${diffDays} days`;
    } else {
        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return diffMinutes <= 1 ? '1 minute' : `${diffMinutes} minutes`;
        }
        return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
    }
};

export const displayDate = async (dateTime: string): Promise<string> => {
    const dateObj = new Date(dateTime);
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const displayTimeString = formatter.format(dateObj);
    return displayTimeString;
};


export const dateObjToMinutesString = (dateObj: Date): string => {
    //console.log(dateObj.toDateString())
    const isoStringFull = dateObj.toISOString();
    const isoStringUpToMinutes = isoStringFull.substring(0, 16);
    return isoStringUpToMinutes;
};

// Generic sort function that works for both meetings and offers
const sortByScheduledTime = <T extends { scheduledFor: string }>(items: T[]): T[] => {
    return items.sort((a, b) => {
        const dateA = new Date(a.scheduledFor);
        const dateB = new Date(b.scheduledFor);
        return dateA.getTime() - dateB.getTime();
    });
};

// Keep the old name for backwards compatibility
const sortMeetingsByScheduledTime = sortByScheduledTime;
