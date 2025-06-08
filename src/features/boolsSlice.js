import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    buttonState: false,
    isFirstTime: true,
    hasEmail: false,
    tab: {index: 0, param: ""},
    shiftSubjects :[],
};

const boolsSlice = createSlice({
  name: 'bools',
  initialState,
  reducers: {
    setButtonState: (state, action) => {
      state.buttonState = action.payload;
    },
    setFirstTime: (state, action) => {
      state.isFirstTime = action.payload;
    },
    setTabIndex: (state, action) => {
      state.tab.index = action.payload;
    },
    setTabParam: (state, action) => {
      state.tab.param = action.payload;
    },
    setShiftSubject: (state, action) => {
      const index = state.shiftSubjects.findIndex(sbj => sbj.conversationID === action.payload.conversationID);
      if (index === -1) {
        state.shiftSubjects.push(action.payload);
      }else{
        state.shiftSubjects[index] = action.payload;
      }
    },
    deleteShiftSubject: (state, action) => {
      const index = state.shiftSubjects.findIndex(sbj => sbj.conversationID === action.payload);
      if (index !== -1) {
        state.shiftSubjects.splice(index, 1);
      }
    },
    setHasEmail: (state, action) => {
      state.hasEmail = action.payload;
    }
  },
});

export const { setButtonState, setTabIndex, setFirstTime, setTabParam, setShiftSubject, deleteShiftSubject, setHasEmail } = boolsSlice.actions;
export default boolsSlice.reducer;