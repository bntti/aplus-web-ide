import { AppBar, Button, Toolbar } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';

const ToolBar = (): JSX.Element => {
    const apiToken = useSelector(selectApiToken);
    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit">
                    <Link to="/courses">Courses</Link>
                </Button>
                <Button color="inherit">{apiToken ? <em>Logged in</em> : <em>Not Logged in</em>}</Button>
            </Toolbar>
        </AppBar>
    );
};

export default ToolBar;
