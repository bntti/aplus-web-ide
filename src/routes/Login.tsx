import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext, UserContext, UserSchema } from '../app/StateProvider';

const Login = (): JSX.Element => {
    const { setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [invalidToken, setInvalidToken] = useState(false);
    const [newApiToken, setNewApiToken] = useState('');

    const loadUser = async (apiToken: string): Promise<void> => {
        const userResponse = await axios
            .get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } })
            .catch((error) => {
                throw error;
            });
        setApiToken(apiToken);
        setUser(UserSchema.parse(userResponse.data));
        navigate('/courses');
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
