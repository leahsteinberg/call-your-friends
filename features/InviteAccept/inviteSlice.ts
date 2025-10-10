import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userPhoneNumber: '',
    userExists: false,
};


const authSlice = createSlice({
    name: 'invite',
    initialState,
    reducers: {
        setUserExists: (state, action) => { // May not need to use
           console.log("set user exists", {action}, action.payload.user);
           if (action.payload.user) {
                state.userPhoneNumber = action.payload.user.phoneNumber;
                state.userExists = true;
           }
        }
    }
});

export const {} = authSlice.actions;
export default authSlice.reducer;