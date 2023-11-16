import { configureStore } from '@reduxjs/toolkit';
import ApiTokenReducer from './state/apiToken';

const store = configureStore({
    reducer: {
        apiToken: ApiTokenReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;

export default store;
