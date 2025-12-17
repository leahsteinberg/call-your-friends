import { SignalType, UserSignal } from "@/types/userSignalsTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface UserSignalState {
    userSignals: UserSignal<SignalType>[];
}

const initialState: UserSignalState = {
    userSignals: [],
}

export const userSignalSlice = createSlice({
    name: 'userSignals',
    initialState,
    reducers: {
        setUserSignals: (state, action: PayloadAction<UserSignal<SignalType>[]>) => {
            state.userSignals = action.payload;
        },

        addUserSignal: (state, action: PayloadAction<UserSignal<SignalType>>) => {
            state.userSignals.push(action.payload);
        },
    }
});

export const { setUserSignals, addUserSignal } = userSignalSlice.actions;

export default userSignalSlice.reducer;
