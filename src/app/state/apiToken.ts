import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
const apiTokenSlice = createSlice({
    name: 'apiToken',
    initialState: {
        apiToken: '',
    },
    reducers: {
        setApiToken: (state, action) => {
            state.apiToken = action.payload;
        },
    },
});
// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectApiToken = (state: RootState): string => state.apiToken.apiToken;
export const { setApiToken } = apiTokenSlice.actions;

export default apiTokenSlice.reducer;
