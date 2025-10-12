export const processMeetings = async(meetings) => {
    const meetingsWithDisplayTimePromises = await meetings
        .map(async (meeting) => 
            ({
                ...meeting,
                displayScheduledFor: await displayDateTime(meeting.scheduledFor)
            })
        );
    const meetingsWithDisplayTime = await Promise.all(meetingsWithDisplayTimePromises)
    return meetingsWithDisplayTime;
}

const displayDateTime = async (dateTime) => {
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




