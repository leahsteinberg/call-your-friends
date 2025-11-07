import { OfferType, ProcessedOfferType } from "../Offers/types";
import { Meeting, ProcessedMeeting } from "./types";

export const processMeetings = async (meetings: Meeting[]): Promise<ProcessedMeeting[]> => {
    const meetingsWithDisplayTimePromises = meetings
        .map(async (meeting): Promise<ProcessedMeeting> => 
            ({
                ...meeting,
                displayScheduledFor: await displayDateTime(meeting.scheduledFor)
            })
        );
    const meetingsWithDisplayTime = await Promise.all(meetingsWithDisplayTimePromises);
    const sortedMeetings = sortMeetingsByScheduledTime(meetingsWithDisplayTime);

    return sortedMeetings;
};


export const processOffers = async (offers: OfferType[]): Promise<ProcessedOffer[]> => {
    console.log("offersssss", offers)
    const offersWithDislayTimePromises = offers
        .map(async (offer): Promise<ProcessedOfferType> =>
            ({
                ...offer,
                displayScheduledFor: await displayDateTime(offer.meeting.scheduledFor)
            })
        )
        const offersWithDisplayTime = await Promise.all(offersWithDislayTimePromises);
        const sortedOffers = sortMeetingsByScheduledTime(offersWithDisplayTime);
        return sortedOffers;
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

export const dateObjToMinutesString = (dateObj: Date): string => {
    //console.log(dateObj.toDateString())
    const isoStringFull = dateObj.toISOString();
    const isoStringUpToMinutes = isoStringFull.substring(0, 16);
    return isoStringUpToMinutes;
};

const sortMeetingsByScheduledTime = (meetingsList: ProcessedMeeting[]): ProcessedMeeting[] => {
    return meetingsList.sort((a, b) => {
        const dateA = new Date(a.scheduledFor);
        const dateB = new Date(b.scheduledFor);
        return dateA.getTime() - dateB.getTime();
    });
};
