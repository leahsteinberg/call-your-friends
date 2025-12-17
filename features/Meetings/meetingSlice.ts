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
        addOfferRollback: (state, action: PayloadAction<ProcessedOfferType>) => {
            const newOffer = action.payload;
            const insertIndex = state.offers.findIndex(
                o => new Date(o.scheduledFor).getTime() > new Date(newOffer.scheduledFor).getTime()
            );
            if (insertIndex === -1) {
                state.offers.push(newOffer);
            } else {
                state.offers.splice(insertIndex, 0, newOffer);
            }
        },
        addMeetingRollback: (state, action: PayloadAction<ProcessedMeetingType>) => {
            const newMeeting = action.payload;
            const insertIndex = state.meetings.findIndex(
                m => new Date(m.scheduledFor).getTime() > new Date(newMeeting.scheduledFor).getTime()
            );
            if (insertIndex === -1) {
                state.meetings.push(newMeeting);
            } else {
                state.meetings.splice(insertIndex, 0, newMeeting);
            }
        },
    }
});

export const { setMeetings, deleteMeetingOptimistic, addMeeting, deleteOfferOptimistic, addOffer, addOfferRollback, addMeetingRollback } = meetingSlice.actions;

export default meetingSlice.reducer;
