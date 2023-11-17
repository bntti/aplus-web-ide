import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';
import { selectUser } from '../app/state/user';

const ToolBar = (): JSX.Element => {
    const apiToken = useSelector(selectApiToken);
    const user = useSelector(selectUser);
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
