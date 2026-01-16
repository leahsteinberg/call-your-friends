import { User } from "@/features/Auth/types";
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

export const getDisplayNameList = (userList: User[]): string => {
    const friendCount = userList.length;
    switch (friendCount) {
        case 0: {
            return 'your friends';
        }
        case 1: {
            return userList[0].name || 'a friend';
        }
        case 2: {
            const hasBothNames = userList[0].name && userList[1].name;
            return hasBothNames ? `${userList[0].name} and ${userList[1].name}` : `two friends`;
        }
        default: {
            const hasBeginningNames = userList[0].name && userList[1].name;
            return hasBeginningNames
                ? `${userList[0].name}, ${userList[1].name} and ${friendCount - 2} friends`
                : `${friendCount} friends`;
        } 
    }
};
