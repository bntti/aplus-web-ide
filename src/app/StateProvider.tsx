import { useMediaQuery } from '@mui/material';
import { createContext } from 'react';
import { z } from 'zod';

import { usePersistantState } from './util';

type Dispatcher<T> = React.Dispatch<React.SetStateAction<T>>;

// Api token
export const ApiTokenSchema = z.string();
export type ApiToken = z.infer<typeof ApiTokenSchema>;
export type ContextApiToken = ApiToken | null;
type ApiTokenContext = { apiToken: ContextApiToken; setApiToken: Dispatcher<ContextApiToken> };
export const ApiTokenContext = createContext<ApiTokenContext>({} as ApiTokenContext);

// GraderToken
export const GraderTokenSchema = z.string();
export type GraderToken = z.infer<typeof GraderTokenSchema>;
export type ContextGraderToken = GraderToken | null;
type GraderTokenContext = { graderToken: ContextGraderToken; setGraderToken: Dispatcher<ContextGraderToken> };
export const GraderTokenContext = createContext<GraderTokenContext>({} as GraderTokenContext);

// Language
export const LanguageSchema = z.enum(['finnish', 'english']);
export type Language = z.infer<typeof LanguageSchema>;
type LanguageContext = { language: Language; setLanguage: Dispatcher<Language> };
export const LanguageContext = createContext<LanguageContext>({} as LanguageContext);

// Theme
export const ThemeSchema = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;
type ThemeContext = { theme: Theme; setTheme: Dispatcher<Theme> };
export const ThemeContext = createContext<ThemeContext>({} as ThemeContext);

// User
export const UserSchema = z.object({
    username: z.string(),
    student_id: z.string(),
    email: z.string(),
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
export type User = z.infer<typeof UserSchema>;
export type ContextUser = User | null;
type UserContext = { user: ContextUser; setUser: Dispatcher<ContextUser> };
export const UserContext = createContext<UserContext>({} as UserContext);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const initialTheme = preferDarkMode ? 'dark' : 'light';

    const [apiToken, setApiToken] = usePersistantState<ContextApiToken>('apiToken', null, ApiTokenSchema);
    const [graderToken, setGraderToken] = usePersistantState<ContextGraderToken>(
        'graderToken',
        null,
        GraderTokenSchema,
    );
    const [language, setLanguage] = usePersistantState<Language>('language', 'english', LanguageSchema);
    const [theme, setTheme] = usePersistantState<Theme>('theme', initialTheme, ThemeSchema);
    const [user, setUser] = usePersistantState<ContextUser>('user', null, UserSchema);

    return (
        <ApiTokenContext.Provider value={{ apiToken, setApiToken }}>
            <GraderTokenContext.Provider value={{ graderToken, setGraderToken }}>
                <LanguageContext.Provider value={{ language, setLanguage }}>
                    <ThemeContext.Provider value={{ theme, setTheme }}>
                        <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
                    </ThemeContext.Provider>
                </LanguageContext.Provider>
            </GraderTokenContext.Provider>
        </ApiTokenContext.Provider>
    );
};
