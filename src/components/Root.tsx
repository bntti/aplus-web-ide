import { Container, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { z } from 'zod';

import { LanguageContext } from '../app/StateProvider';
import { usePersistantState } from '../app/util';
import ToolBar from '../components/ToolBar';

const ThemeSchema = z.enum(['light', 'dark']);
type Theme = z.infer<typeof ThemeSchema>;
type ThemeContext = { colorMode: { toggleTheme: () => void } };
export const ThemeContext = createContext<ThemeContext>({} as ThemeContext);

const Root = (): JSX.Element => {
    const { i18n } = useTranslation();
    const { language } = useContext(LanguageContext);

    // Handle language updates
    useEffect(() => {
        const languageShort = language.slice(0, 2);
        if (languageShort !== i18n.language) {
            i18n.changeLanguage(languageShort).catch(console.error);
            console.log(`Changed to ${languageShort}`);
        }
    }, [i18n, language]);

    // Handle theme updates
    const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const initialTheme = preferDarkMode ? 'dark' : 'light';
    const [mode, setMode] = usePersistantState<Theme>('theme', initialTheme, ThemeSchema);

    const colorMode = useMemo(
        () => ({
            toggleTheme: () => setMode((prevMode: Theme): Theme => (prevMode === 'light' ? 'dark' : 'light')),
        }),
        [setMode],
    );
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

    return (
        <ThemeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                <ToolBar />
                <Container sx={{ paddingBottom: '50px' }}>
                    <Outlet />
                </Container>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default Root;
// const setMode: (value: SetStateAction<"light" | "dark">) => void
// const setMode: (value: SetStateAction<"light" | "dark">) => void
