import { createSlice } from "@reduxjs/toolkit";

export interface MeetingState {}

const initialState = {}

export const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
    },
})

export const {  } = meetingSlice.actions;

export default meetingSlice.reducer;