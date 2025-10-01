import { createSlice } from "@reduxjs/toolkit";

export interface ContactsState {
    value: number
}

const initialState = {
    friends: []
}

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        addContact: (state, action) => {
            if (!state.friends.find((friend) => friend.digits === action.payload.digits)){
                state.friends.push(action.payload);
            }
        },

    },
})

export const { addContact } = contactsSlice.actions;

export default contactsSlice.reducer;