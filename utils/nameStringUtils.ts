import { MeetingType } from "@/features/Meetings/types";

/**
 * Helper to get target user names from a meeting - handles both single and multiple target users
 * @param meeting - The meeting object
 * @returns Comma-separated string of target user names, or null if no names available
 */
export const getTargetUserNames = (meeting: MeetingType): string | null => {
    // Try new multi-user field first
    if (meeting.targetUsers && meeting.targetUsers.length > 0) {
        const names = meeting.targetUsers.map(user => user.name).filter(Boolean);
        if (names.length > 0) {
            return names.join(', ');
        }
    }

    // Fallback to single targetUser for backwards compatibility
    if (meeting.targetUserId && meeting.targetUser?.name) {
        return meeting.targetUser.name;
    }

    // Also check targetUserIds array (IDs exist but no name data)
    if (meeting.targetUserIds && meeting.targetUserIds.length > 0) {
        return null; // IDs exist but no name data
    }

    return null;
};