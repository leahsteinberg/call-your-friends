import {
  FRIEND_SPECIFIC_TARGET_TYPE,
  FUTURE_TIME_TYPE,
  IMMEDIATE_TIME_TYPE,
  MeetingType,
  OPEN_TARGET_TYPE,
  ProcessedMeetingType,
  SYSTEM_PATTERN_SOURCE_TYPE,
  SYSTEM_REAL_TIME_SOURCE_TYPE
} from './types';

/**
 * Check if meeting is a broadcast (immediate + open)
 * Replaces: meeting.meetingType === 'BROADCAST'
 */
export function isBroadcastMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === IMMEDIATE_TIME_TYPE;// && meeting.targetType === OPEN_TARGET_TYPE;
}

/**
 * Check if meeting is advance (future + open)
 * Replaces: meeting.meetingType === 'ADVANCE'
 */
export function isAdvanceMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === FUTURE_TIME_TYPE && meeting.targetType === OPEN_TARGET_TYPE;
}

/**
 * Check if meeting is immediate (regardless of target)
 */
export function isImmediateMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === IMMEDIATE_TIME_TYPE;
}

/**
 * Check if meeting is happening in the future
 */
export function isFutureMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.timeType === FUTURE_TIME_TYPE;
}

/**
 * Check if meeting is open to multiple friends
 */
export function isOpenTargetMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.targetType === OPEN_TARGET_TYPE;
}

/**
 * Check if meeting is friend-specific (NEW CAPABILITY)
 */
export function isFriendSpecificMeeting(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.targetType === FRIEND_SPECIFIC_TARGET_TYPE;
}

/**
 * Check if meeting is a system suggestion
 */
export function isSystemSuggested(meeting: MeetingType | ProcessedMeetingType): boolean {
  return meeting.sourceType === SYSTEM_PATTERN_SOURCE_TYPE || meeting.sourceType === SYSTEM_REAL_TIME_SOURCE_TYPE;
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
