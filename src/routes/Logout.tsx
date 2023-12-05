import { Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';

const Logout = (): JSX.Element => {
    const { setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const navigate = useNavigate();

    useEffect(() => {
        setApiToken(null);
        setUser(null);
        setGraderToken(null);
        localStorage.removeItem('apiToken');
        localStorage.removeItem('user');
        localStorage.removeItem('graderToken');
        navigate('/login');
    }, [navigate, setApiToken, setGraderToken, setUser]);

    return <Typography>Logging out...</Typography>;
};

export default Logout;
