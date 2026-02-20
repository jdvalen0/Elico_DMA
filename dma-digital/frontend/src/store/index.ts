import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import evaluationReducer from './slices/evaluationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    evaluation: evaluationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
