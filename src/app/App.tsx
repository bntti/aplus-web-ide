import { Button, Container, TextField } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import ToolBar from '../components/ToolBar';
import Course from '../routes/Course';
import Courses from '../routes/Courses';
import Exercise from '../routes/Exercise';
import Submission from '../routes/Submission';
import { ApiTokenContext, UserContext } from './StateProvider';

type Courses = {
    count: number;
    results: { id: number; name: string }[];
};

const Root = (): JSX.Element => {
    const { apiToken, setApiToken } = useContext(ApiTokenContext);
    const { setUser } = useContext(UserContext);
    const [newApiToken, setNewApiToken] = useState('');

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        setApiToken(newApiToken);
    };
    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setUser(response.data);
            })
            .catch(console.error);
    }, [setUser, apiToken]);

    return (
        <Container>
            <ToolBar />
            <br />
            {apiToken === null && (
                <form onSubmit={addApiToken}>
                    <TextField
                        label="Api token"
                        value={newApiToken}
                        onChange={(event) => setNewApiToken(event.target.value)}
                    />
                    <Button variant="contained" type="submit">
                        save
                    </Button>
                </form>
            )}
            <Outlet />
        </Container>
    );
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                index: true,
                loader: () => redirect('/courses'),
            },
            { path: 'courses', element: <Courses /> },
            {
                path: 'course/:courseId?',
                element: <Course />,
            },
            {
                path: 'exercise/:exerciseId?',
                element: <Exercise />,
            },
            {
                path: 'submission/:submissionId?',
                element: <Submission />,
            },
        ],
    },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
