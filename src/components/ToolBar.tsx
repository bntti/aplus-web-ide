import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ApiTokenContext, UserContext } from '../app/StateProvider';

const ToolBar = (): JSX.Element => {
    const { apiToken } = useContext(ApiTokenContext);
    const { user } = useContext(UserContext);
    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" component={Link} to="/courses">
                    Courses
                </Button>
                <Typography color="inherit" sx={{ marginLeft: 'auto' }}>
                    {apiToken ? <em>{user.full_name}</em> : <em>Not Logged in</em>}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
