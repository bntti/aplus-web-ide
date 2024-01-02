import { Button, Container, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';

const Logout = (): JSX.Element => {
    let unsaved = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('code')) unsaved = true;
    }

    const navigate = useNavigate();
    const { t } = useTranslation();

    const { setApiToken } = useContext(ApiTokenContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const { setUser } = useContext(UserContext);

    const [needsConfirm, setNeedsConfirm] = useState<boolean>(unsaved);

    useEffect(() => {
        if (needsConfirm) return;
        setApiToken(null);
        setUser(null);
        setGraderToken(null);
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
                <Button onClick={() => navigate('/')} variant="outlined" sx={{ mb: 1 }}>
                    {t('cancel')}
                </Button>
            </Container>
        );
    }
    return <Typography>Logging out...</Typography>;
};

export default Logout;
