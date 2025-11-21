import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProcessedOfferType } from "../Offers/types";
import { ProcessedMeetingType } from "./types";

export interface MeetingState {
    meetings: ProcessedMeetingType[];
    offers: any[];
}

const initialState: MeetingState = {
    meetings: [],
    offers: [],
}

export const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        setMeetings: (state, action: PayloadAction<ProcessedMeetingType[]>) => {
            state.meetings = action.payload;
        },
        deleteMeetingOptimistic: (state, action: PayloadAction<string>) => {
            // Filter out the meeting with the given ID
            state.meetings = state.meetings.filter(meeting => meeting.id !== action.payload);
        },
        addMeeting: (state, action: PayloadAction<ProcessedMeetingType>) => {
            state.meetings.push(action.payload);
        },
        deleteOfferOptimistic: (state, action: PayloadAction<string>) => {
            // Filter out the offer with the given ID
            state.offers = state.offers.filter(offer => offer.id !== action.payload);
        },
        addOffer: (state, action: PayloadAction<ProcessedOfferType>) => {
            state.offers.push(action.payload);
        },
    }
});

export const { setMeetings, deleteMeetingOptimistic, addMeeting, deleteOfferOptimistic } = meetingSlice.actions;

export default meetingSlice.reducer;
