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

**Meetings** — Create meetings with one or more friends at a specific time. Each meeting card shows the other party's avatar and name, the scheduled time, and options to cancel or suggest a new time, as well as to type a request for a new time that is passed into the AI in the backend to generate a better time.

**AI Suggestions** — The backend surfaces draft meeting suggestions based on user history. These appear as dismissable cards you can accept, reschedule, or ignore. User can 

**Push notifications** — Incoming offers, acceptances, and broadcast claims trigger push notifications via Expo.
