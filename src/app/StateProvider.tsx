import { useState, createContext } from 'react';
import { z } from 'zod';

// Api token
type ApiToken = string | null;
type ApiTokenContextT = {
    apiToken: ApiToken;
    setApiToken: React.Dispatch<React.SetStateAction<ApiToken>>;
};
export const ApiTokenContext = createContext<ApiTokenContextT>({} as ApiTokenContextT);

// Language
type Language = 'finnish' | 'english';
type LanguageContextT = {
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
};
export const LanguageContext = createContext<LanguageContextT>({} as LanguageContextT);

// User
export const UserSchema = z.object({
    full_name: z.string(),
    enrolled_courses: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            name: z.string(),
            instance_name: z.string(),
            code: z.string(),
        }),
    ),
});
type User = z.infer<typeof UserSchema> | null;
type UserContextT = { user: User; setUser: React.Dispatch<React.SetStateAction<User>> };
export const UserContext = createContext<UserContextT>({} as UserContextT);

// Theme
type ThemeContextT = { colorMode: { toggleTheme: () => void } };
export const ThemeContext = createContext<ThemeContextT>({} as ThemeContextT);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [apiToken, setApiToken] = useState<ApiToken>(null);
    const [language, setLanguage] = useState<Language>('english');
    const [user, setUser] = useState<User>(null);
    return (
        <ApiTokenContext.Provider value={{ apiToken, setApiToken }}>
            <LanguageContext.Provider value={{ language, setLanguage }}>
                <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
            </LanguageContext.Provider>
        </ApiTokenContext.Provider>
    );
};
