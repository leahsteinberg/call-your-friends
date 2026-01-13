# CallUserButton Component

A React Native component for initiating phone calls with API logging, confirmation dialogs, and user-friendly features.

## Features

### Basic CallUserButton
- ✅ Native phone call integration (iOS/Android)
- ✅ API logging callback before calling
- ✅ Optional confirmation dialog
- ✅ Phone number formatting
- ✅ Loading states
- ✅ Error handling
- ✅ Custom styling
- ✅ Device capability checks

### EnhancedCallUserButton
All basic features plus:
- ✅ Last call time display
- ✅ Post-call feedback collection
- ✅ Call duration tracking
- ✅ Alternative contact methods (FaceTime, WhatsApp, Zoom)
- ✅ Long-press for quick actions
- ✅ App state monitoring (detects return from phone app)

## Installation

The components are ready to use. No additional dependencies required beyond React Native core.

## Basic Usage

```tsx
import CallUserButton from '@/components/CallUserButton';

// Simple usage
<CallUserButton
  phoneNumber="+12345678900"
  userName="John Doe"
/>

// With API logging
<CallUserButton
  phoneNumber="+12345678900"
  userName="John Doe"
  onBeforeCall={async (phoneNumber) => {
    await fetch('/api/log-call', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, timestamp: new Date() }),
    });
  }}
/>
```

## Enhanced Usage

```tsx
import EnhancedCallUserButton from '@/components/CallUserButton/EnhancedCallUserButton';

<EnhancedCallUserButton
  phoneNumber="+12345678900"
  userName="John Doe"
  lastCallTime={new Date('2024-01-10T10:30:00')}
  showLastCallTime={true}
  enablePostCallFeedback={true}
  onBeforeCall={async (phoneNumber) => {
    await logCallStart(phoneNumber);
  }}
  onCallCompleted={async (callLog) => {
    // callLog includes: timestamp, duration, notes
    await logCallEnd(callLog);
  }}
  alternativeContactMethods={[
    {
      type: 'facetime',
      identifier: 'john@example.com',
      label: 'FaceTime',
    },
    {
      type: 'whatsapp',
      identifier: '+12345678900',
      label: 'WhatsApp',
    },
  ]}
/>
```

## Props

### CallUserButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `phoneNumber` | `string` | Required | Phone number to call |
| `userName` | `string` | Optional | Display name for the user |
| `onBeforeCall` | `(phoneNumber: string) => Promise<void>` | Optional | Callback before initiating call (for API logging) |
| `onCallError` | `(error: Error) => void` | Optional | Error callback |
| `buttonText` | `string` | Optional | Custom button text |
| `style` | `ViewStyle` | Optional | Custom button styles |
| `textStyle` | `TextStyle` | Optional | Custom text styles |
| `disabled` | `boolean` | `false` | Disable the button |
| `showConfirmation` | `boolean` | `true` | Show confirmation dialog before calling |

### EnhancedCallUserButton Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lastCallTime` | `Date` | Optional | Timestamp of last call |
| `showLastCallTime` | `boolean` | `true` | Display last call time below button |
| `enablePostCallFeedback` | `boolean` | `true` | Show feedback prompt after call |
| `onCallCompleted` | `(callLog: CallLog) => Promise<void>` | Optional | Callback after call with duration and notes |
| `alternativeContactMethods` | `Array<ContactMethod>` | `[]` | Alternative contact options |

## Integration Examples

### In an Event Card

```tsx
import CallUserButton from '@/components/CallUserButton';

export default function OtherMeetingBroadcastCard({ meeting }) {
  const handleBeforeCall = async (phoneNumber: string) => {
    await logCall({
      userId: meeting.userFromId,
      meetingId: meeting.id,
      phoneNumber,
    });
  };

  return (
    <EventCard>
      <EventCard.Header>
        <EventCard.Title>On a call with {meeting.userFrom.name}</EventCard.Title>
      </EventCard.Header>

      <EventCard.Body>
        <CallUserButton
          phoneNumber={meeting.userFrom.phoneNumber}
          userName={meeting.userFrom.name}
          onBeforeCall={handleBeforeCall}
          style={{ marginTop: 12 }}
        />
      </EventCard.Body>
    </EventCard>
  );
}
```

### In a Contact List

```tsx
import EnhancedCallUserButton from '@/components/CallUserButton/EnhancedCallUserButton';

export default function ContactListItem({ contact, callHistory }) {
  return (
    <View>
      <Text>{contact.name}</Text>
      <EnhancedCallUserButton
        phoneNumber={contact.phoneNumber}
        userName={contact.name}
        lastCallTime={callHistory[contact.id]?.lastCall}
        onCallCompleted={async (callLog) => {
          await updateCallHistory(contact.id, callLog);
        }}
      />
    </View>
  );
}
```

## API Logging Example

Create a service to handle call logging:

```tsx
// services/callLoggingApi.ts
export const useLogCallMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      phoneNumber: string;
      meetingId?: string;
    }) => {
      const response = await fetch('/api/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        }),
      });
      return response.json();
    },
  });
};

// Usage
const [logCall] = useLogCallMutation();

<CallUserButton
  phoneNumber={phoneNumber}
  onBeforeCall={async (number) => {
    await logCall({ userId, phoneNumber: number });
  }}
/>
```

## Styling

Both components support full custom styling:

```tsx
<CallUserButton
  phoneNumber="+12345678900"
  style={{
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 12,
  }}
  textStyle={{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }}
/>
```

## Platform Support

- ✅ iOS
- ✅ Android
- ⚠️ Web (shows error - phones can't make calls)

## Security & Privacy

- Phone numbers are only used for dialing
- API logging is opt-in via callbacks
- No phone numbers are stored by the component
- All logging happens through your provided callbacks

## Future Enhancements

See [FEATURES.md](./FEATURES.md) for a comprehensive list of potential enhancements.

## Troubleshooting

### "Cannot Make Call" Error
- Device may not support phone calls (iPad, Android tablet, web)
- Check phone number format (should include country code)
- Provide `alternativeContactMethods` for fallback options

### API Logging Not Working
- Ensure `onBeforeCall` is async and properly awaited
- Check network connectivity
- Verify API endpoint is correct
- Add error logging in the callback

### Post-Call Feedback Not Showing
- Ensure `enablePostCallFeedback={true}`
- Check that `onCallCompleted` callback is provided
- Verify app has permissions to detect app state changes

## Contributing

Feel free to extend these components with additional features from FEATURES.md!
