import { Brightness3, Brightness7 } from '@mui/icons-material';
import { AppBar, Button, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ApiTokenContext, ThemeContext, UserContext } from '../app/StateProvider';

const ToolBar = (): JSX.Element => {
    const theme = useTheme();
    const { colorMode } = useContext(ThemeContext);
    const { apiToken } = useContext(ApiTokenContext);
    const { user } = useContext(UserContext);
    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" component={Link} to="/courses">
                    Courses
                </Button>
                <IconButton sx={{ ml: 1, marginLeft: 'auto' }} onClick={colorMode.toggleTheme} color="inherit">
                    {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness3 />}
                </IconButton>

                <Typography color="inherit">{apiToken ? <em>{user.full_name}</em> : <em>Not Logged in</em>}</Typography>
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
