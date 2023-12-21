import { createContext, useState } from 'react';
import { z } from 'zod';

// Api token
export type ApiTokenN = string;
export type ApiToken = ApiTokenN | null;
type ApiTokenContext = {
    apiToken: ApiToken;
    setApiToken: React.Dispatch<React.SetStateAction<ApiToken>>;
};
export const ApiTokenContext = createContext<ApiTokenContext>({} as ApiTokenContext);

// Language
type Language = 'finnish' | 'english';
type LanguageContext = {
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
};
export const LanguageContext = createContext<LanguageContext>({} as LanguageContext);

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
export type UserN = z.infer<typeof UserSchema>;
export type User = UserN | null;
type UserContext = { user: User; setUser: React.Dispatch<React.SetStateAction<User>> };
export const UserContext = createContext<UserContext>({} as UserContext);

// GraderToken
export type GraderTokenN = string;
export type GraderToken = GraderTokenN | null;
type GraderTokenContext = {
    graderToken: GraderToken;
    setGraderToken: React.Dispatch<React.SetStateAction<GraderToken>>;
};
export const GraderTokenContext = createContext<GraderTokenContext>({} as GraderTokenContext);

// Theme
type ThemeContext = { colorMode: { toggleTheme: () => void } };
export const ThemeContext = createContext<ThemeContext>({} as ThemeContext);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [apiToken, setApiToken] = useState<ApiToken>(null);
    const [language, setLanguage] = useState<Language>('english');
    const [user, setUser] = useState<User>(null);
    const [graderToken, setGraderToken] = useState<GraderToken>(null);
    return (
        <ApiTokenContext.Provider value={{ apiToken, setApiToken }}>
            <LanguageContext.Provider value={{ language, setLanguage }}>
                <UserContext.Provider value={{ user, setUser }}>
                    <GraderTokenContext.Provider value={{ graderToken, setGraderToken }}>
                        {children}
                    </GraderTokenContext.Provider>
                </UserContext.Provider>
            </LanguageContext.Provider>
        </ApiTokenContext.Provider>
    );
};
