import { Button, Container, CssBaseline, TextField, ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ApiTokenContext, ThemeContext, UserContext } from '../app/StateProvider';
import ToolBar from '../components/ToolBar';

const Root = (): JSX.Element => {
    const { apiToken, setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const [newApiToken, setNewApiToken] = useState('');

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        setApiToken(newApiToken);
    };
    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setUser(response.data);
            })
            .catch(console.error);
    }, [setUser, apiToken]);

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
                <Container>
                    <ToolBar />
                    <br />
                    {apiToken === null && (
                        <form onSubmit={addApiToken}>
                            <TextField
                                label="Api token"
                                value={newApiToken}
                                onChange={(event) => setNewApiToken(event.target.value)}
                            />
                            <Button variant="contained" type="submit">
                                save
                            </Button>
                        </form>
                    )}
                    <Outlet />
                </Container>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default Root;
