import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isBroadcasting: false,
};

const broadcastSlice = createSlice({
    name: 'broadcast',
    initialState,
    reducers: {
        setBroadcastState: (state, action) => {
            state.isBroadcasting = action.payload;
        },
        startBroadcast: (state) => {
            state.isBroadcasting = true;
        },
        endBroadcast: (state) => {
            state.isBroadcasting = false;
        }
    }
});

export const { setBroadcastState, startBroadcast, endBroadcast } = broadcastSlice.actions;
export default broadcastSlice.reducer;