/**
 * Utility functions for meeting time calculations
 */

/**
 * Check if a meeting is "actionable" - meaning it's starting soon (≤30 mins) or currently happening
 * @param scheduledFor - ISO string of meeting start time
 * @param scheduledEnd - ISO string of meeting end time
 * @returns true if meeting starts in ≤30 mins OR is currently happening
 */
export function isMeetingActionable(scheduledFor: string, scheduledEnd: string): boolean {
    const now = new Date();
    const startTime = new Date(scheduledFor);
    const endTime = new Date(scheduledEnd);

    // Meeting is currently happening (now is between start and end)
    if (now >= startTime && now <= endTime) {
        return true;
    }

    // Meeting starts within 30 minutes
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    if (startTime <= thirtyMinutesFromNow && startTime > now) {
        return true;
    }

    return false;
}

/**
 * Check if a meeting is currently happening
 * @param scheduledFor - ISO string of meeting start time
 * @param scheduledEnd - ISO string of meeting end time
 * @returns true if the meeting is currently in progress
 */
export function isMeetingHappening(scheduledFor: string, scheduledEnd: string): boolean {
    const now = new Date();
    const startTime = new Date(scheduledFor);
    const endTime = new Date(scheduledEnd);

    return now >= startTime && now <= endTime;
}
