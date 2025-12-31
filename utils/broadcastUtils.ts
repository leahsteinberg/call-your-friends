import { FRIEND_SPECIFIC_TARGET_TYPE, GROUP_TARGET_TYPE, OPEN_TARGET_TYPE, TargetType } from "@/features/Meetings/types";

export const determineTargetType = (targetUserIds: string[]): TargetType => {
    if (!targetUserIds) {
        return OPEN_TARGET_TYPE;
    }
    // Determine targetType based on number of selected friends
    if (targetUserIds.length === 0) {
        return OPEN_TARGET_TYPE;
    } else if (targetUserIds.length === 1) {
        return FRIEND_SPECIFIC_TARGET_TYPE;
    }
    return GROUP_TARGET_TYPE;
};