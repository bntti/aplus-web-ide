import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

type User = {
    full_name: string;
    enrolled_courses: { id: number; name: string }[];
};
const userSlice = createSlice({
    name: 'user',
    initialState: {
        full_name: '',
        enrolled_courses: [],
    } as User,
    reducers: {
        setUser: (_, action: PayloadAction<User>) => {
            return action.payload;
        },
    },
});

export const selectUser = (state: RootState): User => state.user;
export const { setUser } = userSlice.actions;

export default userSlice.reducer;
