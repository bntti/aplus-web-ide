import { AccountBox, Brightness3, Brightness7, Home, Logout, Person } from '@mui/icons-material';
import {
    AppBar,
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    useTheme,
} from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeContext } from './Root';
import { ApiTokenContext, UserContext } from '../app/StateProvider';

const ToolBar = (): JSX.Element => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { colorMode } = useContext(ThemeContext);
    const { user } = useContext(UserContext);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [anchorWidth, setAnchorWidth] = useState<number | null>(null);

    return (
        <AppBar position="static" sx={{ mb: 2.5 }}>
            <Toolbar>
                <IconButton color="inherit" size="large" component={Link} to="/">
                    <Home />
                </IconButton>

                <IconButton onClick={colorMode.toggleTheme} color="inherit" size="large" sx={{ ml: 'auto' }}>
                    {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness3 />}
                </IconButton>

                {apiToken === null ? (
                    <Button color="inherit" component={Link} to="/login">
                        {t('log-in')}
                    </Button>
                ) : (
                    <>
                        <Button
                            size="large"
                            color="inherit"
                            startIcon={<Person />}
                            onClick={(event) => {
                                setAnchorEl(event.currentTarget);
                                setAnchorWidth(event.currentTarget.offsetWidth);
                            }}
                        >
                            {user ? <em>{user.full_name}</em> : <em>Loading user...</em>}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    navigate('/profile');
                                }}
                                sx={{ width: anchorWidth ?? '100%' }}
                            >
                                <ListItemIcon>
                                    <AccountBox />
                                </ListItemIcon>
                                <ListItemText>{t('profile')}</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    setAnchorEl(null);
                                    navigate('/logout', { state: { userAction: true } });
                                }}
                            >
                                <ListItemIcon>
                                    <Logout />
                                </ListItemIcon>
                                <ListItemText>{t('log-out')}</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
