import { Brightness3, Brightness7, Home, Logout } from '@mui/icons-material';
import TranslateIcon from '@mui/icons-material/Translate';
import { AppBar, Button, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ApiTokenContext, LanguageContext, ThemeContext, UserContext } from '../app/StateProvider';

const ToolBar = (): JSX.Element => {
    const theme = useTheme();
    const { colorMode } = useContext(ThemeContext);
    const { apiToken } = useContext(ApiTokenContext);
    const { user } = useContext(UserContext);
    const { language, setLanguage } = useContext(LanguageContext);

    return (
        <AppBar position="static" sx={{ mb: 2.5 }}>
            <Toolbar>
                <IconButton color="inherit" size="large" component={Link} to="/">
                    <Home />
                </IconButton>

                <IconButton
                    sx={{ marginLeft: 'auto' }}
                    onClick={() => {
                        setLanguage(language === 'finnish' ? 'english' : 'finnish');
                    }}
                    color="inherit"
                    size="large"
                >
                    <TranslateIcon />
                </IconButton>
                <IconButton onClick={colorMode.toggleTheme} color="inherit" size="large">
                    {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness3 />}
                </IconButton>

                {apiToken === null ? (
                    <Button color="inherit" component={Link} to="/login">
                        Login
                    </Button>
                ) : (
                    <>
                        <Typography color="inherit">
                            {user ? <em>{user.full_name}</em> : <em>Loading user...</em>}
                        </Typography>

                        <IconButton color="inherit" component={Link} to="/logout" size="large">
                            <Logout />
                        </IconButton>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
