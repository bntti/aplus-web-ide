import { createContext } from 'react';
import { z } from 'zod';

import { usePersistantState } from './util';

type Dispatcher<T> = React.Dispatch<React.SetStateAction<T>>;

// Api token
export const ApiTokenSchema = z.string();
export type ApiToken = z.infer<typeof ApiTokenSchema>;
type ContextApiToken = ApiToken | null;
type ApiTokenContext = { apiToken: ContextApiToken; setApiToken: Dispatcher<ContextApiToken> };
export const ApiTokenContext = createContext<ApiTokenContext>({} as ApiTokenContext);

// GraderToken
export const GraderTokenSchema = z.string();
export type GraderToken = z.infer<typeof GraderTokenSchema>;
type ContextGraderToken = GraderToken | null;
type GraderTokenContext = { graderToken: ContextGraderToken; setGraderToken: Dispatcher<ContextGraderToken> };
export const GraderTokenContext = createContext<GraderTokenContext>({} as GraderTokenContext);

// Language
const LanguageSchema = z.enum(['finnish', 'english']);
export type Language = z.infer<typeof LanguageSchema>;
type LanguageContext = { language: Language; setLanguage: Dispatcher<Language> };
export const LanguageContext = createContext<LanguageContext>({} as LanguageContext);

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
type ContextUser = User | null;
type UserContext = { user: ContextUser; setUser: Dispatcher<ContextUser> };
export const UserContext = createContext<UserContext>({} as UserContext);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [apiToken, setApiToken] = usePersistantState<ContextApiToken>('apiToken', null, ApiTokenSchema);
    const [graderToken, setGraderToken] = usePersistantState<ContextGraderToken>(
        'graderToken',
        null,
        GraderTokenSchema,
    );
    const [language, setLanguage] = usePersistantState<Language>('language', 'english', LanguageSchema);
    const [user, setUser] = usePersistantState<ContextUser>('user', null, UserSchema);

    return (
        <ApiTokenContext.Provider value={{ apiToken, setApiToken }}>
            <GraderTokenContext.Provider value={{ graderToken, setGraderToken }}>
                <LanguageContext.Provider value={{ language, setLanguage }}>
                    <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
                </LanguageContext.Provider>
            </GraderTokenContext.Provider>
        </ApiTokenContext.Provider>
    );
};
