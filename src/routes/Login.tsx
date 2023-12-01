import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext, UserSchema } from '../app/StateProvider';

const Login = (): JSX.Element => {
    const { setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const { setGraderToken } = useContext(GraderTokenContext);
    const navigate = useNavigate();

    const [invalidToken, setInvalidToken] = useState(false);
    const [newApiToken, setNewApiToken] = useState('');

    const loadUser = async (apiToken: string): Promise<void> => {
        const userResponse = await axios
            .get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } })
            .catch((error) => {
                throw error;
            });
        const user = UserSchema.parse(userResponse.data);

        const graderTokenResponse = await axios.post(
            '/api/v2/get-token',
            {
                taud: 'grader',
                exp: '01:00:00',
                permissions: user.enrolled_courses.map((course) => ['exercise', 1, { id: course.id }]),
            },
            { headers: { Authorization: `Token ${apiToken}` } },
        );
        const graderToken = graderTokenResponse.request.response.replaceAll('"', '');

        setApiToken(apiToken);
        setUser(user);
        setGraderToken(graderToken);
        localStorage.setItem('apiToken', apiToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('graderToken', graderToken);
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
