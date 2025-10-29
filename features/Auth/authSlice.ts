import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    isAuthenticated: false,
    userToken: null,
    user: {
        id: '',
        email: '',
        name: '',
        image: null,
        emailVerified: false,
        createdAt: '',
        updatedAt: '',
    },
    status: 'idle',
    error: null,
};

// const initialState = {
//     isAuthenticated: true,
//     userToken: "pwH7ZC5IVcSKvQZ7OEwrYyNlYDAANib0",
//     //userToken: "dIqiHERhz86DjlTz5k1JwK6dlcyPqtPr",
//     user: {
//         id: "uqE1jmBkAYpKrwqgaOD4RBWj9Am6TVW3",
//         //id: "DozxnwPNWuuhdHrINpeQvhtiJWmNJEGc",
//         email: 'leahsteinberg1@gmail.com',
//         name: '',
//         image: null,
//         emailVerified: false,
//         createdAt: '',
//         updatedAt: "2025-10-02T18:53:53.752Z",
//     },
//     status: 'idle',
//     error: null,
// };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogInCredentials: (state, action) => {
            console.log("LOG IN CREDENTIALS", {action}, action.payload.user);
            state.status = 'successful';
            state.isAuthenticated = true;
            state.userToken = action.payload.userToken;
            state.user = action.payload.user;
        }
    }
});

export const {setLogInCredentials} = authSlice.actions;
export default authSlice.reducer;
