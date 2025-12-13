import { MeetingType, ProcessedMeetingType } from './types';

/**
 * Check if meeting is a broadcast (immediate + open)
 * Replaces: meeting.meetingType === 'BROADCAST'
 */
export function isBroadcastMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === 'IMMEDIATE' && meeting.targetType === 'OPEN';
}

/**
 * Check if meeting is advance (future + open)
 * Replaces: meeting.meetingType === 'ADVANCE'
 */
export function isAdvanceMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === 'FUTURE' && meeting.targetType === 'OPEN';
}

/**
 * Check if meeting is immediate (regardless of target)
 */
export function isImmediateMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === 'IMMEDIATE';
}

/**
 * Check if meeting is happening in the future
 */
export function isFutureMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === 'FUTURE';
}

/**
 * Check if meeting is open to multiple friends
 */
export function isOpenTargetMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.targetType === 'OPEN';
}

/**
 * Check if meeting is friend-specific (NEW CAPABILITY)
 */
export function isFriendSpecificMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.targetType === 'FRIEND_SPECIFIC';
}

/**
 * Check if meeting is a system suggestion
 */
export function isSystemSuggested(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.sourceType === 'SYSTEM_PATTERN' || meeting.sourceType === 'SYSTEM_REAL_TIME';
}

/**
 * Get display label for meeting type (for debugging/logging)
 */
export function getMeetingTypeLabel(meeting: MeetingType | ProcessedMeetingType): string {
  if (isBroadcastMeeting(meeting)) return 'Broadcast';
  if (isAdvanceMeeting(meeting)) return 'Advance';
  if (isFriendSpecificMeeting(meeting)) return 'Friend-Specific';
  return `${meeting.timeType}-${meeting.targetType}`;
}
