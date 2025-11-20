import { createSlice } from "@reduxjs/toolkit";

export interface OfferState {}

const initialState = {}

export const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {
    },
})

export const {  } = offerSlice.actions;

export default offerSlice.reducer;