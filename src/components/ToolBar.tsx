import { Brightness3, Brightness7 } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import TranslateIcon from '@mui/icons-material/Translate';
import { AppBar, Button, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ApiTokenContext, LanguageContext, ThemeContext, UserContext } from '../app/StateProvider';

const ToolBar = (): JSX.Element => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { colorMode } = useContext(ThemeContext);
    const { apiToken, setApiToken } = useContext(ApiTokenContext);
    const { user, setUser } = useContext(UserContext);
    const { language, setLanguage } = useContext(LanguageContext);

    return (
        <AppBar position="static" sx={{ mb: 2.5 }}>
            <Toolbar>
                <Button color="inherit" component={Link} to="/courses">
                    Courses
                </Button>

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
                    <Typography color="inherit">
                        <em>Not Logged in</em>
                    </Typography>
                ) : (
                    <>
                        <Typography color="inherit">
                            {user ? <em>{user.full_name}</em> : <em>Loading user...</em>}
                        </Typography>

                        <IconButton
                            color="inherit"
                            onClick={() => {
                                setApiToken(null);
                                setUser(null);
                                localStorage.removeItem('apiToken');
                                localStorage.removeItem('user');
                                navigate('/login');
                            }}
                            size="large"
                        >
                            <LogoutIcon />
                        </IconButton>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
