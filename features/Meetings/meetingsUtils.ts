export const processMeetings = async(meetings) => {
    const meetingsWithDisplayTimePromises = await meetings
        .map(async (meeting) => 
            ({
                ...meeting,
                displayScheduledFor: await displayDateTime(meeting.scheduledFor)
            })
        );
    const meetingsWithDisplayTime = await Promise.all(meetingsWithDisplayTimePromises)
    const sortedMeetings = sortMeetingsByScheduledTime(meetingsWithDisplayTime)

    return meetingsWithDisplayTime;
}


export const displayDateTime = async (dateTime : String) => {
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
    const displayTimeString = formatter.format(dateObj)
    return displayTimeString
}

export const dateObjToMinutesString = (dateObj) => {
        const isoStringFull = dateObj.toISOString();
        const isoStringUpToMinutes = isoStringFull.substring(0, 16);
        return isoStringUpToMinutes
}

const sortMeetingsByScheduledTime = (meetingsList) => {
    return meetingsList.sort((a, b) =>  {
        const dateA = new Date(a.scheduledFor);
        const dateB = new Date(b.scheduledFor);
        return dateA.getTime() - dateB.getTime();
    })
}
