import React, { useState } from 'react';

type ApiToken = string | null;
type ApiTokenContextT = {
    apiToken: ApiToken;
    setApiToken: React.Dispatch<React.SetStateAction<ApiToken>>;
};
export const ApiTokenContext = React.createContext<ApiTokenContextT>({} as ApiTokenContextT);

type User = {
    full_name: string;
    enrolled_courses: { id: number; name: string; instance_name: string; code: string }[];
} | null;
type UserContextT = { user: User; setUser: React.Dispatch<React.SetStateAction<User>> };
export const UserContext = React.createContext<UserContextT>({} as UserContextT);

type ThemeContextT = { colorMode: { toggleTheme: () => void } };
export const ThemeContext = React.createContext<ThemeContextT>({} as ThemeContextT);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [apiToken, setApiToken] = useState<ApiToken>(null);
    const [user, setUser] = useState<User>(null);
    return (
        <ApiTokenContext.Provider value={{ apiToken, setApiToken }}>
            <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
        </ApiTokenContext.Provider>
    );
};
