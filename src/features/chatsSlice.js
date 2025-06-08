import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chats : [],
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    updateChats: (state, action) => {
        // converting the objects
        const tabChats = action.payload;
        const newChats = tabChats.map((chat)=>({id: chat._insta_username, display_name: chat._display_name, pp_url: chat._pp_url}));

        // changing
        state.chats = newChats;
    },
  },
});

export const { updateChats } = chatsSlice.actions;
export default chatsSlice.reducer;