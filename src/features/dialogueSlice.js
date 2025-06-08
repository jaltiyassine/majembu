import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    dialogue: "",
    status: {
        platform: "instagram",
        currentPeople: 0,
        totalChats: 0,
        actionDetails: {
          state :"none",
          username: null,
          emotion: null,
        }
      },
};

const dialogueSlice = createSlice({
  name: 'dialogue',
  initialState,
  reducers: {
    changeDialogue: (state, action) => {
        state.dialogue = action.payload;
      },
    changeCurrentPeople: (state, action) => {
        state.status.currentPeople = action.payload;
      },
    changeTotalChats: (state, action) => {
        state.status.totalChats = action.payload;
      },
    changeActionDetails: (state, action) => {
        state.status.actionDetails = action.payload;
      },
  },
});

export const { changeDialogue, changeCurrentPeople, changeTotalChats, changeActionDetails } = dialogueSlice.actions;
export default dialogueSlice.reducer;