import { createSlice } from "@reduxjs/toolkit";

export interface ContactsState {
    value: number
}

const initialState = {
    sentInvites: [],
}

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        addSentInvite: (state, action) => {
            if (!state.sentInvites.find((invited) => invited.userToPhoneNumber === action.payload.userToPhoneNumber)){
                state.sentInvites.push(action.payload);
            }
        },
        setSentInvites: (state, action) => {
            state.sentInvites = action.payload
        },
    }})  
export const { addSentInvite, setSentInvites } = contactsSlice.actions;

export default contactsSlice.reducer;