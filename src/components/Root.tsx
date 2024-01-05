import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { LanguageContext, ThemeContext } from '../app/StateProvider';
import ToolBar from '../components/ToolBar';

const Root = (): JSX.Element => {
    const { i18n } = useTranslation();
    const { theme } = useContext(ThemeContext);
    const { language } = useContext(LanguageContext);

    useEffect(() => {
        const languageShort = language.slice(0, 2);
        if (languageShort !== i18n.language) {
            i18n.changeLanguage(languageShort).catch(console.error);
            console.log(`Changed to ${languageShort}`);
        }
    }, [i18n, language]);
    const MUITheme = useMemo(() => createTheme({ palette: { mode: theme } }), [theme]);

    return (
        <ThemeProvider theme={MUITheme}>
            <CssBaseline enableColorScheme />
            <ToolBar />
            <Container sx={{ paddingBottom: '50px' }}>
                <Outlet />
            </Container>
        </ThemeProvider>
    );
};

export default Root;
