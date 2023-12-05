import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';
import { getGraderToken, getUser } from '../app/api/login';

const Login = (): JSX.Element => {
    const { state } = useLocation();
    const { setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const navigate = useNavigate();

    const [invalidToken, setInvalidToken] = useState(false);
    const [newApiToken, setNewApiToken] = useState('');

    const loadUser = async (apiToken: string): Promise<void> => {
        const user = await getUser(apiToken);
        const graderToken = await getGraderToken(apiToken, user.enrolled_courses);

        setApiToken(apiToken);
        setUser(user);
        setGraderToken(graderToken);
        localStorage.setItem('apiToken', apiToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('graderToken', graderToken);
        if (state.from) navigate(state.from);
        else navigate('/');
    };

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        loadUser(newApiToken).catch(() => {
            setInvalidToken(true);
        });
    };

    return (
        <Container component={Paper} sx={{ pt: 2.5, pb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Login
            </Typography>
            <form onSubmit={addApiToken}>
                <TextField
                    fullWidth
                    label="Api token"
                    value={newApiToken}
                    error={invalidToken}
                    helperText={invalidToken && 'Invalid API token'}
                    onChange={(event) => {
                        setInvalidToken(false);
                        setNewApiToken(event.target.value);
                    }}
                />
                <Button variant="contained" type="submit" sx={{ mt: 1 }}>
                    Log in
                </Button>
            </form>
        </Container>
    );
};

export default Login;
