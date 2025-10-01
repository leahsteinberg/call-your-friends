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
                console.log("state.friends - before - ", state.friends);
                state.friends.push(action.payload);
                console.log("is unique")
                console.log("state.friends - after - ", state.friends);
            }
            console.log("IN REDUCER!!", action.payload);
        },

    },
})

export const { addContact } = contactsSlice.actions;

export default contactsSlice.reducer;