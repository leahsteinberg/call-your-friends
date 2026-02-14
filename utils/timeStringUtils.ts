/**
 * Format a date to show "Today" if the date is today, otherwise return the original display string.
 * Keeps the time and timezone portion intact.
 */
export function getDisplayDate(scheduledFor: string, displayScheduledFor: string): string {
    const itemDate = new Date(scheduledFor);
    const today = new Date();

    const isToday =
        itemDate.getFullYear() === today.getFullYear() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getDate() === today.getDate();

    if (isToday) {
        // Extract time portion from displayScheduledFor (e.g., "at 3:00 PM PST")
        const timeMatch = displayScheduledFor.match(/at\s+.+$/i);
        return timeMatch ? `Today ${timeMatch[0]}` : displayScheduledFor;
    }

    return displayScheduledFor;
}

/**
 * Format a date to show only the time portion (e.g., "3:30 PM").
 * Used in event cards where the day is already shown in the section header.
 */
export function formatTimeOnly(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
