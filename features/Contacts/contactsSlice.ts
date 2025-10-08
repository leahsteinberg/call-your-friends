import { createSlice } from "@reduxjs/toolkit";

export interface ContactsState {
    value: number
}

const initialState = {
    friends: []
    // friends: [{phoneNumber: '8185218419', lastName: 'Steinberg', firstName: 'Leah'}]
}

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        addContact: (state, action) => {
            console.log("in add contact!!");
            if (!state.friends.find((friend) => friend.digits === action.payload.digits)){
                state.friends.push(action.payload);
            }
        },

    },
})

export const { addContact } = contactsSlice.actions;

export default contactsSlice.reducer;