import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';
import { getGraderToken, getUser } from '../app/api/login';
import { auth } from '../app/auth';

const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { t } = useTranslation();

    const { setApiToken } = useContext(ApiTokenContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const { setUser } = useContext(UserContext);

    const [invalidToken, setInvalidToken] = useState(false);
    const [newApiToken, setNewApiToken] = useState('');

    const loadUser = async (apiToken: string): Promise<void> => {
        const newUser = await getUser(apiToken);
        const newGraderToken = await getGraderToken(apiToken, newUser.enrolled_courses);

        setApiToken(apiToken);
        setUser(newUser);
        setGraderToken(newGraderToken);
        auth.signIn(apiToken, newGraderToken);
        if (state && state.from) navigate(state.from);
        else navigate('/');
    };

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const errors = [
            'Invalid token.',
            'Invalid token header. No credentials provided.',
            'Invalid token header. Token string should not contain spaces.',
            'Invalid token header. Token string should not contain invalid characters.',
        ];
        loadUser(newApiToken).catch((error) => {
            if (errors.includes(error?.response?.data?.detail)) setInvalidToken(true);
            else throw error;
        });
    };

    return (
        <Container component={Paper} sx={{ pt: 2.5, pb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {t('log-in')}
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
                    {t('log-in')}
                </Button>
            </form>
        </Container>
    );
};

export default Login;
