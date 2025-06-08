import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    configMessages : [],
    IDs: []
};

const configMessagesSlice = createSlice({
    name: 'configMessages',
    initialState,
    reducers: {
        addConfigMessage: (state, action) => {
        const idToAdd = action.payload.person.id;
        let doesExist = state.configMessages.find(msg => msg.person.id === idToAdd);
        if(doesExist){
            return;
        }

        state.configMessages.push(action.payload);
        state.IDs.push(idToAdd);
        },
        modifyConfigMessage: (state, action) => {
        const index = state.configMessages.findIndex(msg => msg.id === action.payload.id);
        if (index !== -1) {
            state.configMessages[index] = action.payload;
        }
        },
        removeConfigMessage: (state, action) => {
        const idToRemove = action.payload;
        const index = state.configMessages.findIndex(msg => msg.id === idToRemove);
        state.IDs = state.IDs.filter(id => id !== state.configMessages[index].person.id);
        state.configMessages = state.configMessages.filter(msg => msg.id !== idToRemove);
        },
    },
});
  
export const { addConfigMessage, modifyConfigMessage, removeConfigMessage } = configMessagesSlice.actions;
export default configMessagesSlice.reducer;