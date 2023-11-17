import { configureStore } from '@reduxjs/toolkit';
import ApiTokenReducer from './state/apiToken';
import UserReducer from './state/user';

const store = configureStore({
    reducer: {
        apiToken: ApiTokenReducer,
        user: UserReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;

export default store;
