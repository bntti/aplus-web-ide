import { Button, Container, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from '../app/StateProvider';

const Logout = (): JSX.Element => {
    let unsaved = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('code')) unsaved = true;
    }
    const [needsConfirm, setNeedsConfirm] = useState<boolean>(unsaved);
    const { setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const navigate = useNavigate();

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
                    You might have unsaved changes, are you sure you want to log out?
                </Typography>

                <Button onClick={() => setNeedsConfirm(false)} color="error" variant="outlined" sx={{ mb: 1, mr: 1 }}>
                    Log out
                </Button>
                <Button onClick={() => navigate('/')} variant="outlined" sx={{ mb: 1 }}>
                    Cancel
                </Button>
            </Container>
        );
    }
    return <Typography>Logging out...</Typography>;
};

export default Logout;
