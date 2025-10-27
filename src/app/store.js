import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from '../fitur/AuthSlice';

export const store = configureStore({
    reducer: {
        auth: authSliceReducer,
    },
});
