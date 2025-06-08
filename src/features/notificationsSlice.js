import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    {
      id: 12345,
      severity: "info",
      message: "Majembu is currently only available for use with Instagram's inbox.",
      dateToShow: 1744888377000,
    },
  ]
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotif: (state, action) => {
      const messageAlreadyExists = state.notifications.some(
        (notification) => notification.message === action.payload.message
      );

      if (!messageAlreadyExists) {
        state.notifications.push(action.payload);
      }
    },
    removeNotif: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },
  },
});

export const { addNotif, removeNotif } = notificationsSlice.actions;
export default notificationsSlice.reducer;