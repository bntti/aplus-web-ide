import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

const apiTokenSlice = createSlice({
    name: 'apiToken',
    initialState: '',
    reducers: {
        setApiToken: (_, action: PayloadAction<string>) => {
            return action.payload;
        },
    },
});

export const selectApiToken = (state: RootState): string => state.apiToken;
export const { setApiToken } = apiTokenSlice.actions;

export default apiTokenSlice.reducer;
