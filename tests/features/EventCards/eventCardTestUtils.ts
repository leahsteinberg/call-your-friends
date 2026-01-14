/**
 * Shared test utilities for Event Card components
 *
 * Provides reusable mocks, factories, and helpers for testing event cards
 */

import { ProcessedMeetingType, ProcessedOfferType } from '@/features/Meetings/types';
import {
  IMMEDIATE_TIME_TYPE,
  FUTURE_TIME_TYPE,
  OPEN_TARGET_TYPE,
  FRIEND_SPECIFIC_TARGET_TYPE,
  USER_INTENT_SOURCE_TYPE,
} from '@/features/Meetings/types';

/**
 * Factory function to create mock meetings with sensible defaults
 */
export const createMockMeeting = (overrides: Partial<ProcessedMeetingType> = {}): ProcessedMeetingType => ({
  id: 'meeting-123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  displayScheduledFor: 'Now',
  scheduledFor: '2024-01-01T12:00:00Z',
  scheduledEnd: '2024-01-01T13:00:00Z',
  userFromId: 'test-user-id',
  meetingState: 'SEARCHING',
  timeType: IMMEDIATE_TIME_TYPE,
  targetType: OPEN_TARGET_TYPE,
  sourceType: USER_INTENT_SOURCE_TYPE,
  targetUserIds: [],
  acceptedUserIds: [],
  minParticipants: 1,
  maxParticipants: 10,
  title: 'Test Meeting',
  ...overrides,
});

/**
 * Factory for broadcast meeting (immediate + open)
 */
export const createBroadcastMeeting = (overrides: Partial<ProcessedMeetingType> = {}): ProcessedMeetingType => {
  return createMockMeeting({
    timeType: IMMEDIATE_TIME_TYPE,
    targetType: OPEN_TARGET_TYPE,
    title: 'Test Broadcast',
    ...overrides,
  });
};

/**
 * Factory for advance meeting (future + open)
 */
export const createAdvanceMeeting = (overrides: Partial<ProcessedMeetingType> = {}): ProcessedMeetingType => {
  return createMockMeeting({
    timeType: FUTURE_TIME_TYPE,
    targetType: OPEN_TARGET_TYPE,
    displayScheduledFor: 'Tomorrow at 3pm',
    scheduledFor: '2024-01-02T15:00:00Z',
    title: 'Test Advance Meeting',
    ...overrides,
  });
};

/**
 * Factory for draft meeting
 */
export const createDraftMeeting = (overrides: Partial<ProcessedMeetingType> = {}): ProcessedMeetingType => {
  return createMockMeeting({
    meetingState: 'DRAFT',
    title: 'Test Draft',
    ...overrides,
  });
};

/**
 * Redux mock setup - call in beforeAll or beforeEach
 */
export const setupReduxMocks = (options: {
  userId?: string;
  dispatch?: jest.Mock;
} = {}) => {
  const mockDispatch = options.dispatch || jest.fn();
  const userId = options.userId || 'test-user-id';

  const useSelector = jest.fn((selector) => {
    // Mock auth.user.id selector
    if (typeof selector === 'function') {
      return userId;
    }
    return userId;
  });

  return { mockDispatch, useSelector, userId };
};

/**
 * Common component mocks that most event cards use
 */
export const setupCommonComponentMocks = () => {
  jest.mock('@/components/AnimationComponents/AnimatedText', () => 'AnimatedText');
  jest.mock('@/components/CardActionDecorations/VibeButton', () => 'VibeButton');
  jest.mock('@/components/CardActionDecorations/StackedFriendAvatars', () => 'StackedFriendAvatars');
  jest.mock('@/components/CallUserButton/CallUserButton', () => 'CallUserButton');
};

/**
 * Setup mock for RTK Query mutation hook
 * Returns the mock function and a helper to set its behavior
 */
export const createMockMutation = () => {
  const mockMutate = jest.fn();
  const mockHook = jest.fn(() => [mockMutate, {}]);

  return {
    mockMutate,
    mockHook,
    // Helpers to configure mock behavior
    mockSuccess: (data?: any) => {
      mockMutate.mockResolvedValue({ unwrap: () => Promise.resolve(data) });
    },
    mockError: (error: Error) => {
      mockMutate.mockResolvedValue({ unwrap: () => Promise.reject(error) });
    },
    mockLoading: () => {
      const promise = new Promise(() => {}); // Never resolves
      mockMutate.mockResolvedValue({ unwrap: () => promise });
    },
  };
};

/**
 * Mock Redux slices actions
 */
export const mockSliceActions = () => {
  const mockActions = {
    // Broadcast slice
    endBroadcast: jest.fn(() => ({ type: 'broadcast/end' })),
    startBroadcast: jest.fn(() => ({ type: 'broadcast/start' })),

    // Meeting slice
    deleteMeetingOptimistic: jest.fn((id) => ({ type: 'meeting/deleteOptimistic', payload: id })),
    addMeetingRollback: jest.fn((meeting) => ({ type: 'meeting/addRollback', payload: meeting })),
    updateMeeting: jest.fn((meeting) => ({ type: 'meeting/update', payload: meeting })),
  };

  return mockActions;
};

/**
 * Helper to mock alert
 */
export const mockAlert = () => {
  const alertSpy = jest.spyOn(global, 'alert').mockImplementation();
  return {
    alertSpy,
    expectAlertCalled: (message?: string) => {
      if (message) {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining(message));
      } else {
        expect(alertSpy).toHaveBeenCalled();
      }
    },
    restore: () => alertSpy.mockRestore(),
  };
};

/**
 * Create mock user objects for acceptedUsers/targetUsers
 */
export const createMockUsers = (count: number, startId = 1) => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${startId + i}`,
    name: names[i] || `User ${startId + i}`,
    phoneNumber: `555000${1000 + startId + i}`,
  }));
};
