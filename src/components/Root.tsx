import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { ThemeContext } from '../app/StateProvider';
import ToolBar from '../components/ToolBar';

const Root = (): JSX.Element => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    const colorMode = useMemo(
        () => ({
            toggleTheme: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

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
