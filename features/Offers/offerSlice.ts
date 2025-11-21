import { createSlice } from "@reduxjs/toolkit";

export interface OffersSliceState {}

const initialState: OffersSliceState = {}

export const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {
    },
})

export const {  } = offerSlice.actions;

export default offerSlice.reducer;