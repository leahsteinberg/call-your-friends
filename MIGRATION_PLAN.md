# Frontend Migration Plan: Replacing MeetingType with Multi-Dimensional Fields

## Overview
Frontend migration to replace deprecated `meetingType: BROADCAST | ADVANCE` with the new multi-dimensional system (`timeType`, `targetType`, `sourceType`). Backend migration is already complete.

## Migration Goal
Update frontend code to use:
- `timeType`: IMMEDIATE | FUTURE | UNKNOWN
- `targetType`: OPEN | FRIEND_SPECIFIC | GROUP
- `sourceType`: USER_INTENT | SYSTEM_PATTERN | SYSTEM_REAL_TIME

Instead of:
- ~~`meetingType`: BROADCAST | ADVANCE~~ (deprecated)
- ~~`offerType`: BROADCAST | ADVANCE~~ (deprecated)

---

## What Changed in the Backend

The backend now returns meetings with these fields:
```typescript
{
  id: string;
  timeType: 'IMMEDIATE' | 'FUTURE' | 'UNKNOWN';
  targetType: 'OPEN' | 'FRIEND_SPECIFIC' | 'GROUP';
  sourceType: 'USER_INTENT' | 'SYSTEM_PATTERN' | 'SYSTEM_REAL_TIME';
  intentLabel?: string;
  targetUserId?: string;
  // ... other fields
}
```

### Field Mapping
```
Old meetingType → New fields
BROADCAST       → timeType: IMMEDIATE, targetType: OPEN
ADVANCE         → timeType: FUTURE, targetType: OPEN
```

---

## Migration Steps

### Step 1: Update TypeScript Types

#### File: `features/Meetings/types.ts`

**Remove:**
```typescript
export type MeetingTypeValue = 'ADVANCE' | 'BROADCAST';
```

**Add:**
```typescript
export type TimeType = 'IMMEDIATE' | 'FUTURE' | 'UNKNOWN';
export type TargetType = 'OPEN' | 'FRIEND_SPECIFIC' | 'GROUP';
export type SourceType = 'USER_INTENT' | 'SYSTEM_PATTERN' | 'SYSTEM_REAL_TIME';
```

**Update MeetingType interface:**
```typescript
export interface MeetingType extends MeetingEvent {
  // REMOVE this field:
  // meetingType: MeetingTypeValue;

  // ADD these fields:
  timeType: TimeType;
  targetType: TargetType;
  sourceType: SourceType;
  intentLabel?: string;
  targetUserId?: string;

  // Existing fields:
  meetingState: 'SEARCHING' | 'REJECTED' | 'ACCEPTED' | 'PAST' | 'DRAFT' | 'EXPIRED';
  title: string;
  broadcastMetadata?: BroadcastMetadata;
}
```

**Update BroadcastMetadata interface:**
```typescript
export interface BroadcastMetadata {
  subState: BroadcastSubState;
  offerClaimedId?: string;
  pendingAt?: string; // NEW field from backend
}
```

#### File: `features/Offers/types.ts`

**Remove:**
```typescript
export type OfferTypeValue = 'ADVANCE' | 'BROADCAST';
```

**Update OfferType interface:**
```typescript
export interface OfferType extends MeetingEvent {
  meetingId: string;
  offerState: OfferState;
  // REMOVE this field:
  // offerType: OfferTypeValue;

  // Offer type is determined by its meeting
}
```

---

### Step 2: Create Helper Functions

#### New File: `features/Meetings/meetingHelpers.ts`

```typescript
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
```

#### New File: `features/Offers/offerHelpers.ts`

```typescript
import { ProcessedOfferType } from './types';
import { isBroadcastMeeting, isAdvanceMeeting } from '../Meetings/meetingHelpers';

/**
 * Check if offer is for a broadcast meeting
 * Replaces: offer.offerType === 'BROADCAST'
 */
export function isBroadcastOffer(offer: ProcessedOfferType): boolean {
  return offer.meeting ? isBroadcastMeeting(offer.meeting) : false;
}

/**
 * Check if offer is for an advance meeting
 * Replaces: offer.offerType === 'ADVANCE'
 */
export function isAdvanceOffer(offer: ProcessedOfferType): boolean {
  return offer.meeting ? isAdvanceMeeting(offer.meeting) : false;
}
```

---

### Step 3: Update Components

#### File: `features/EventCards/cardSelector.tsx`

**Before:**
```typescript
export function selectMeetingCard(meeting: ProcessedMeetingType, { userId, refresh }: CardSelectorProps) {
  if (meeting.meetingType === 'BROADCAST') {
    // ...
  }
  return <MeetingCard meeting={meeting} />;
}

export function selectOfferCard(offer: ProcessedOfferType, { refresh }: CardSelectorProps) {
  if (offer.offerType === 'BROADCAST') {
    return <OtherBroadcastCard offer={offer} />;
  }
  return <OfferCard offer={offer} />;
}
```

**After:**
```typescript
import { isBroadcastMeeting } from '../Meetings/meetingHelpers';
import { isBroadcastOffer } from '../Offers/offerHelpers';

export function selectMeetingCard(
  meeting: ProcessedMeetingType,
  { userId, refresh }: CardSelectorProps
): React.JSX.Element {
  if (isBroadcastMeeting(meeting)) {
    const selfCreated = meeting.userFromId === userId;

    if (selfCreated) {
      if (meeting.meetingState === 'PAST') {
        return <></>;
      }
      return <SelfBroadcastCard meeting={meeting} />
    } else {
      return <OtherMeetingBroadcastCard meeting={meeting} />
    }
  }

  return <MeetingCard meeting={meeting} />;
}

export function selectOfferCard(
  offer: ProcessedOfferType,
  { refresh }: Pick<CardSelectorProps, 'refresh'>
): React.JSX.Element {
  if (isBroadcastOffer(offer)) {
    return <OtherBroadcastCard offer={offer} />;
  }

  return <OfferCard offer={offer} />;
}
```

#### File: `features/Today/todayUtils.ts`

**Before:**
```typescript
export function sortTodayItemsWithBroadcastPriority(items: TodayItem[], userId: string) {
  items.forEach(item => {
    if (item.type === 'meeting') {
      const meeting = item.data as ProcessedMeetingType;
      if (meeting.meetingType === 'BROADCAST' && meeting.userFromId === userId) {
        selfCreatedBroadcastMeetings.push(item);
      }
    } else if (item.type === 'offer') {
      const offer = item.data as ProcessedOfferType;
      if (offer.offerType === 'BROADCAST') {
        broadcastOffers.push(item);
      }
    }
  });
  // ...
}
```

**After:**
```typescript
import { isBroadcastMeeting } from '../Meetings/meetingHelpers';
import { isBroadcastOffer } from '../Offers/offerHelpers';

export function sortTodayItemsWithBroadcastPriority(items: TodayItem[], userId: string): TodayItem[] {
  const selfCreatedBroadcastMeetings: TodayItem[] = [];
  const broadcastOffers: TodayItem[] = [];
  const otherItems: TodayItem[] = [];

  items.forEach(item => {
    if (item.type === 'meeting') {
      const meeting = item.data as ProcessedMeetingType;
      if (isBroadcastMeeting(meeting) && meeting.userFromId === userId) {
        selfCreatedBroadcastMeetings.push(item);
      } else {
        otherItems.push(item);
      }
    } else if (item.type === 'offer') {
      const offer = item.data as ProcessedOfferType;
      if (isBroadcastOffer(offer)) {
        broadcastOffers.push(item);
      } else {
        otherItems.push(item);
      }
    }
  });

  const sortByTime = (a: TodayItem, b: TodayItem) =>
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();

  selfCreatedBroadcastMeetings.sort(sortByTime);
  broadcastOffers.sort(sortByTime);
  otherItems.sort(sortByTime);

  return [...selfCreatedBroadcastMeetings, ...broadcastOffers, ...otherItems];
}
```

#### File: `features/Today/TodayList.tsx`

**Before:**
```typescript
const hasSelfBroadcastMeeting = todayItems.some(item => {
  if (item.type === 'meeting') {
    const meeting = item.data as ProcessedMeetingType;
    return meeting.meetingType === 'BROADCAST' &&
           meeting.userFromId === userId &&
           meeting.meetingState !== 'PAST';
  }
  return false;
});
```

**After:**
```typescript
import { isBroadcastMeeting } from '../Meetings/meetingHelpers';

const hasSelfBroadcastMeeting = todayItems.some(item => {
  if (item.type === 'meeting') {
    const meeting = item.data as ProcessedMeetingType;
    return isBroadcastMeeting(meeting) &&
           meeting.userFromId === userId &&
           meeting.meetingState !== 'PAST';
  }
  return false;
});
```

#### File: `features/EventCards/MeetingCard.tsx`

Find and replace:
```typescript
// Before:
if (selfCreatedMeeting && meeting.meetingType === 'BROADCAST') {

// After:
import { isBroadcastMeeting } from '../Meetings/meetingHelpers';

if (selfCreatedMeeting && isBroadcastMeeting(meeting)) {
```

#### File: `features/Meetings/MeetingsList.tsx`

Find and replace:
```typescript
// Before:
if (item.meetingType === 'BROADCAST') {

// After:
import { isBroadcastMeeting } from '../Meetings/meetingHelpers';

if (isBroadcastMeeting(item)) {
```

---

## Implementation Checklist

### Step 1: Types ✅
- [ ] Update `features/Meetings/types.ts`
  - [ ] Remove `MeetingTypeValue`
  - [ ] Add `TimeType`, `TargetType`, `SourceType`
  - [ ] Remove `meetingType` field from `MeetingType`
  - [ ] Add new fields: `timeType`, `targetType`, `sourceType`, etc.
  - [ ] Add `pendingAt` to `BroadcastMetadata`
- [ ] Update `features/Offers/types.ts`
  - [ ] Remove `OfferTypeValue`
  - [ ] Remove `offerType` field from `OfferType`

### Step 2: Helpers ✅
- [ ] Create `features/Meetings/meetingHelpers.ts`
  - [ ] Add `isBroadcastMeeting()`
  - [ ] Add `isAdvanceMeeting()`
  - [ ] Add `isImmediateMeeting()`
  - [ ] Add `isFutureMeeting()`
  - [ ] Add `isOpenTargetMeeting()`
  - [ ] Add `isFriendSpecificMeeting()`
  - [ ] Add `isSystemSuggested()`
  - [ ] Add `getMeetingTypeLabel()`
- [ ] Create `features/Offers/offerHelpers.ts`
  - [ ] Add `isBroadcastOffer()`
  - [ ] Add `isAdvanceOffer()`

### Step 3: Component Updates ✅
- [ ] Update `features/EventCards/cardSelector.tsx`
  - [ ] Import helpers
  - [ ] Replace `meetingType` checks with `isBroadcastMeeting()`
  - [ ] Replace `offerType` checks with `isBroadcastOffer()`
- [ ] Update `features/Today/todayUtils.ts`
  - [ ] Import helpers
  - [ ] Replace `meetingType` checks with `isBroadcastMeeting()`
  - [ ] Replace `offerType` checks with `isBroadcastOffer()`
- [ ] Update `features/Today/TodayList.tsx`
  - [ ] Import `isBroadcastMeeting`
  - [ ] Replace `meetingType` check
- [ ] Update `features/EventCards/MeetingCard.tsx`
  - [ ] Import `isBroadcastMeeting`
  - [ ] Replace any `meetingType` checks
- [ ] Update `features/Meetings/MeetingsList.tsx`
  - [ ] Import `isBroadcastMeeting`
  - [ ] Replace any `meetingType` checks

### Step 4: Verification ✅
- [ ] Search entire codebase for `meetingType` (should find 0 usages)
- [ ] Search entire codebase for `offerType` (should find 0 usages)
- [ ] Search entire codebase for `MeetingTypeValue` (should find 0 usages)
- [ ] Search entire codebase for `OfferTypeValue` (should find 0 usages)
- [ ] Fix any TypeScript errors
- [ ] Run type checking: `npx tsc --noEmit`

### Step 5: Testing ✅
- [ ] **Broadcast creation flow**
  - [ ] Click "Broadcast Now"
  - [ ] Verify SelfBroadcastCard renders
  - [ ] Verify broadcast appears at top of Today view
- [ ] **Broadcast acceptance flow**
  - [ ] Friend sees OtherBroadcastCard (offer)
  - [ ] Try to accept broadcast
  - [ ] Confirm acceptance
  - [ ] Verify meeting shows as accepted
- [ ] **Advance meeting flow**
  - [ ] Create future meeting
  - [ ] Verify correct cards render
  - [ ] Accept meeting
  - [ ] Verify both users see accepted meeting
- [ ] **Sorting**
  - [ ] Broadcasts appear first
  - [ ] Then broadcast offers
  - [ ] Then other meetings
- [ ] **Edge cases**
  - [ ] Empty state
  - [ ] Multiple broadcasts
  - [ ] Cancelled broadcasts

---

## Search Commands (For Verification)

Run these to find any remaining references:

```bash
# Should return 0 results after migration:
grep -r "meetingType" --include="*.ts" --include="*.tsx" features/
grep -r "offerType" --include="*.ts" --include="*.tsx" features/
grep -r "MeetingTypeValue" --include="*.ts" --include="*.tsx" features/
grep -r "OfferTypeValue" --include="*.ts" --include="*.tsx" features/
grep -r "'BROADCAST'" --include="*.ts" --include="*.tsx" features/
grep -r "'ADVANCE'" --include="*.ts" --include="*.tsx" features/

# These should return results (the helper functions):
grep -r "isBroadcastMeeting" --include="*.ts" --include="*.tsx" features/
grep -r "isAdvanceMeeting" --include="*.ts" --include="*.tsx" features/
```

---

## Files Changed

### New Files (2)
1. `features/Meetings/meetingHelpers.ts`
2. `features/Offers/offerHelpers.ts`

### Modified Files (5)
1. `features/Meetings/types.ts`
2. `features/Offers/types.ts`
3. `features/EventCards/cardSelector.tsx`
4. `features/Today/todayUtils.ts`
5. `features/Today/TodayList.tsx`

### Potentially Modified Files (2)
6. `features/EventCards/MeetingCard.tsx` (if it has `meetingType` checks)
7. `features/Meetings/MeetingsList.tsx` (if it has `meetingType` checks)

**Total: 7-9 files**

---

## Benefits After Migration

1. ✅ **Type-safe**: New fields are required, no more undefined behavior
2. ✅ **Cleaner code**: Using helper functions instead of direct field checks
3. ✅ **Future-ready**: Can now support:
   - Friend-specific immediate calls
   - Unknown time suggestions
   - System-suggested meetings
4. ✅ **Maintainable**: Logic centralized in helper functions
5. ✅ **Backwards compatible**: Helper functions abstract the field names

---

## Rollback Plan

If issues arise:
1. Revert to previous commit
2. Re-deploy previous version
3. Report issues to backend team (if API contract mismatch)

---

## Timeline Estimate

- **Types**: 30 minutes
- **Helpers**: 30 minutes
- **Component updates**: 2 hours
- **Testing**: 2 hours
- **Verification**: 30 minutes

**Total: ~5-6 hours of work**

---

## Notes

- Backend already returns new fields, so no API changes needed
- All existing functionality should work identically
- This is a refactor, not a feature change
- After this migration, we can implement new meeting types
