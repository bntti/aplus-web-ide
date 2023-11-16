import { Button, Container, TextField } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';
import ToolBar from '../components/ToolBar';
import Course from '../routes/Course';
import Courses from '../routes/Courses';
import Exercise from '../routes/Exercise';
import { setApiToken } from './state/apiToken';
import Submission from '../routes/Submission';

type Courses = {
    count: number;
    results: { id: number; name: string }[];
};

const Root = (): JSX.Element => {
    const apiToken = useSelector(selectApiToken);
    const dispatch = useDispatch();
    const [newApiToken, setNewApiToken] = useState('');

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        dispatch(setApiToken(newApiToken));
    };

    return (
        <Container>
            <ToolBar />
            <br />
            {apiToken !== '' ? (
                <></>
            ) : (
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
