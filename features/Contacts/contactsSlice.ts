import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContactsState, SentInvite } from "./types";

const initialState: ContactsState = {
    sentInvites: [],
};

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        addSentInvite: (state, action: PayloadAction<SentInvite>) => {
            if (!state.sentInvites.find((invited) => invited.userToPhoneNumber === action.payload.userToPhoneNumber)) {
                state.sentInvites.push(action.payload);
            }
        },
        setSentInvites: (state, action: PayloadAction<SentInvite[]>) => {
            state.sentInvites = action.payload;
        },
    }
});

export const { addSentInvite, setSentInvites } = contactsSlice.actions;

export default contactsSlice.reducer;