import { Button, Container, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';
import { auth } from '../app/auth';

const getNeedsConfirm = (state: { userAction?: true }): boolean => {
    if (!state || !state.userAction) return false;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('code')) return true;
    }
    return false;
};

const Logout = (): JSX.Element => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { t } = useTranslation();

    const { setApiToken } = useContext(ApiTokenContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const { setUser } = useContext(UserContext);

    const [needsConfirm, setNeedsConfirm] = useState<boolean>(getNeedsConfirm(state));

    useEffect(() => {
        if (needsConfirm) return;
        setApiToken(null);
        setUser(null);
        setGraderToken(null);
        auth.signOut();
        localStorage.clear();
        navigate('/');
    }, [needsConfirm, navigate, setApiToken, setGraderToken, setUser]);

    if (needsConfirm) {
        return (
            <Container component={Paper} sx={{ pt: 2.5, pb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('logout-confirm-unsaved')}
                </Typography>

                <Button onClick={() => setNeedsConfirm(false)} color="error" variant="outlined" sx={{ mb: 1, mr: 1 }}>
                    {t('log-out')}
                </Button>
                <Button component={Link} to="/" variant="outlined" sx={{ mb: 1 }}>
                    {t('cancel')}
                </Button>
            </Container>
        );
    }
    return <Typography>{t('logging-out')}</Typography>;
};

export default Logout;
