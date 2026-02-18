# call-your-friends

React Native app for scheduling spontaneous phone calls with friends. Backend repo [here](https://github.com/leahsteinberg/call-your-friends-backend).

---

## Stack

| | |
|---|---|
| Framework | React Native + Expo |
| Navigation | Expo Router (file-based) |
| State & API | Redux Toolkit + RTK Query |
| Animations | React Native Reanimated + Skia |
| Auth | better-auth |
| Icons | SF Symbols (iOS) / lucide-react-native (Android, web) |

---

## Features

**Broadcast** — Go "live" to signal you're free right now. The backend fans the broadcast out to friends as offers; the first to accept converts it into a confirmed meeting, and removes offers from other friends. Represented with an Instagram stories-style UI.

**Meetings** — Create meetings with one or more friends at a specific time. Each meeting card shows the other party's avatar and name, the scheduled time, and options to cancel or suggest a new time.

**Offers** — When someone targets you with a meeting, you receive an offer card you can accept or reject.

**AI Suggestions** — The backend surfaces draft meeting suggestions based on user history. These appear as dismissable cards you can accept, reschedule, or ignore.

**Push notifications** — Incoming offers, acceptances, and broadcast claims trigger push notifications via Expo.

---

## Notable technical decisions

**RTK Query with polling instead of WebSockets.** Meetings and offers poll every 30 seconds with tag-based cache invalidation on mutations. This covers the app's real-time needs without the complexity of a persistent socket connection.

**Optimistic UI updates with Redux rollback.** Cancellations and rejections remove the card from the list immediately via a Redux action, then reinsert it if the API call fails — keeping the UI up-to-date while preserving correctness.
