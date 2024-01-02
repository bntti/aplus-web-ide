import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';
import { getGraderToken, getUser } from '../app/api/login';

const Login = (): JSX.Element => {
    const { state } = useLocation();
    const { t } = useTranslation();
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
        if (state && state.from) navigate(state.from);
        else navigate('/');
    };

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        loadUser(newApiToken).catch((error) => {
            if (error?.response?.data?.detail === 'Invalid token.') {
                setInvalidToken(true);
            } else {
                throw error;
            }
        });
    };

    return (
        <Container component={Paper} sx={{ pt: 2.5, pb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {t('login')}
            </Typography>
            <form onSubmit={addApiToken}>
                <TextField
                    fullWidth
                    label="API token"
                    value={newApiToken}
                    error={invalidToken}
                    helperText={invalidToken && t('invalid-api-token')}
                    onChange={(event) => {
                        setInvalidToken(false);
                        setNewApiToken(event.target.value);
                    }}
                />
                <Button variant="contained" type="submit" sx={{ mt: 1 }}>
                    {t('login')}
                </Button>
            </form>
        </Container>
    );
};

export default Login;
