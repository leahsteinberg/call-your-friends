import SelfBroadcastCard from '@/features/EventCards/SelfBroadcastCard_DEPRECATED';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
  createBroadcastMeeting,
  createMockUsers,
  mockAlert
} from './eventCardTestUtils';

// Mock Redux
const mockDispatch = jest.fn();
const mockUserId = 'test-user-id';
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(() => mockUserId),
}));

// Mock RTK Query - create mock inline
const mockEndBroadcast = jest.fn();
jest.mock('@/services/meetingApi', () => ({
  useBroadcastEndMutation: () => [mockEndBroadcast, {}],
}));

// Mock slice actions - must use jest.fn() directly
jest.mock('@/features/Broadcast/broadcastSlice', () => ({
  endBroadcast: jest.fn(() => ({ type: 'broadcast/end' })),
}));
jest.mock('@/features/Meetings/meetingSlice', () => ({
  deleteMeetingOptimistic: jest.fn((id) => ({ type: 'meeting/deleteOptimistic', payload: id })),
  addMeetingRollback: jest.fn((meeting) => ({ type: 'meeting/addRollback', payload: meeting })),
}));

// Mock components
jest.mock('@/components/AnimationComponents/AnimatedText', () => 'AnimatedText');
jest.mock('@/components/CardActionDecorations/VibeButton', () => 'VibeButton');

describe('SelfBroadcastCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - No Accepted Users', () => {
    it('should render open broadcast state with animated dots', () => {
      const meeting = createBroadcastMeeting();
      const { getByText, UNSAFE_queryByType } = render(
        <SelfBroadcastCard meeting={meeting} />
      );

      expect(getByText(/On a call right now/i)).toBeTruthy();
      expect(getByText(/Who's free?/i)).toBeTruthy();
      expect(getByText(/End Call/i)).toBeTruthy();
      expect(UNSAFE_queryByType('AnimatedText')).toBeTruthy();
    });

    it('should render with vibe badge when intentLabel exists', () => {
      const meeting = createBroadcastMeeting({ intentLabel: 'catch-up' });
      const { UNSAFE_queryByType } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(UNSAFE_queryByType('VibeButton')).toBeTruthy();
    });

    it('should not render vibe badge when intentLabel is null', () => {
      const meeting = createBroadcastMeeting({ intentLabel: undefined });
      const { UNSAFE_queryByType } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(UNSAFE_queryByType('VibeButton')).toBeFalsy();
    });
  });

  describe('Rendering - With Accepted Users', () => {
    it('should render with single accepted user name', () => {
      const [alice] = createMockUsers(1);
      const meeting = createBroadcastMeeting({
        acceptedUserIds: [alice.id],
        acceptedUsers: [alice],
      });
      const { getByText, UNSAFE_queryByType } = render(
        <SelfBroadcastCard meeting={meeting} />
      );

      expect(getByText(/Alice/i)).toBeTruthy();
      expect(getByText(/Unclaim Call/i)).toBeTruthy();
      expect(UNSAFE_queryByType('AnimatedText')).toBeFalsy();
    });

    it('should render multiple accepted users comma-separated', () => {
      const users = createMockUsers(2);
      const meeting = createBroadcastMeeting({
        acceptedUserIds: users.map(u => u.id),
        acceptedUsers: users,
      });
      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(getByText(/Alice, Bob/i)).toBeTruthy();
    });

    it('should filter out falsy names from display', () => {
      const meeting = createBroadcastMeeting({
        acceptedUserIds: ['user-1', 'user-2', 'user-3'],
        acceptedUsers: [
          { id: 'user-1', name: 'Alice' },
          { id: 'user-2', name: undefined },
          { id: 'user-3', name: 'Charlie' },
        ],
      });
      const { getByText, queryByText } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(getByText(/Alice, Charlie/i)).toBeTruthy();
      expect(queryByText(/undefined/i)).toBeFalsy();
    });
  });

  describe('Rendering - With Target Users (no accepted)', () => {
    it('should show target users when no accepted users', () => {
      const [charlie] = createMockUsers(1, 3);
      const meeting = createBroadcastMeeting({
        targetUserIds: [charlie.id],
        targetUsers: [charlie],
        acceptedUserIds: [],
        acceptedUsers: [],
      });
      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(getByText(/Charlie/i)).toBeTruthy();
    });
  });

  describe('User Interactions - End Broadcast', () => {
    it('should dispatch optimistic delete and call API on End Call press', async () => {
      const meeting = createBroadcastMeeting();
      endBroadcastMutation.mockSuccess();

      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      fireEvent.press(getByText(/End Call/i));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'meeting/deleteOptimistic' })
        );
        expect(endBroadcastMutation.mockMutate).toHaveBeenCalledWith({
          meetingId: 'meeting-123',
          userId: 'test-user-id',
        });
      });
    });

    it('should dispatch endBroadcast action on API success', async () => {
      const meeting = createBroadcastMeeting();
      endBroadcastMutation.mockSuccess();

      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      fireEvent.press(getByText(/End Call/i));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'broadcast/end' })
        );
      });
    });

    it('should rollback and alert on API error', async () => {
      const meeting = createBroadcastMeeting();
      const alert = mockAlert();
      endBroadcastMutation.mockError(new Error('API Error'));

      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      fireEvent.press(getByText(/End Call/i));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'meeting/addRollback' })
        );
        alert.expectAlertCalled('Failed to cancel broadcast');
      });

      alert.restore();
    });

    it('should NOT dispatch endBroadcast on API error', async () => {
      const meeting = createBroadcastMeeting();
      endBroadcastMutation.mockError(new Error('API Error'));
      jest.spyOn(global, 'alert').mockImplementation();

      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      fireEvent.press(getByText(/End Call/i));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'meeting/addRollback' })
        );
      });

      // Should NOT have called endBroadcast
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'broadcast/end' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle meeting with no names gracefully', () => {
      const meeting = createBroadcastMeeting({
        acceptedUserIds: ['user-1'],
        acceptedUsers: [{ id: 'user-1', name: undefined }],
      });
      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(getByText(/End Call/i)).toBeTruthy();
    });

    it('should handle empty accepted users array', () => {
      const meeting = createBroadcastMeeting({
        acceptedUserIds: [],
        acceptedUsers: [],
      });
      const { getByText } = render(<SelfBroadcastCard meeting={meeting} />);

      expect(getByText(/On a call right now/i)).toBeTruthy();
    });
  });
});
