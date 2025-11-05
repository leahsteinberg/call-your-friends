import { createSlice } from "@reduxjs/toolkit";

export interface MeetingState {}

const initialState = {
    meetings: [],
    offers: [],
}

export const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        addMeeting: (state, action: PayloadAction<Meeting>) => {
            const meetingExists = state.meetings
                .find((meeting) => meeting.id === action.payload.id);
            if (!meetingExists) 
                state.meetings.push(action.payload);
            }
        }
    });

export const {} = meetingSlice.actions;

export default meetingSlice.reducer;



// export const contactsSlice = createSlice({
//     name: 'contacts',
//     initialState,
//     reducers: {
//         addSentInvite: (state, action: PayloadAction<SentInvite>) => {
//             if (!state.sentInvites.find((invited) => invited.userToPhoneNumber === action.payload.userToPhoneNumber)) {
//                 state.sentInvites.push(action.payload);
//             }
//         },
//         setSentInvites: (state, action: PayloadAction<SentInvite[]>) => {
//             state.sentInvites = action.payload;
//         },
//     }
// });