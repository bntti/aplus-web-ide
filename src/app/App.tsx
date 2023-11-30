import { Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Navigate, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';

import { ApiTokenContext, UserContext } from './StateProvider';
import Root from '../components/Root';
import Course from '../routes/Course';
import Courses from '../routes/Courses';
import Exercise from '../routes/Exercise';
import Login from '../routes/Login';
import Submission from '../routes/Submission';

const RequireAuth = ({ children }: { children: JSX.Element }): JSX.Element => {
    const { apiToken, setApiToken } = useContext(ApiTokenContext);
    const { user, setUser } = useContext(UserContext);

    const storageApiToken = localStorage.getItem('apiToken');
    const storageUser = localStorage.getItem('user');

    useEffect(() => {
        if (storageApiToken && storageUser) {
            setApiToken(storageApiToken);
            setUser(JSON.parse(storageUser));
        }
    }, [storageApiToken, storageUser, setApiToken, setUser]);

    if (apiToken && user) return children;
    if (storageApiToken && storageUser) return <Typography>Loading</Typography>;

    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '/',
                loader: () => redirect('/courses'),
            },
            { path: 'login', element: <Login /> },

            {
                path: 'courses',
                element: (
                    <RequireAuth>
                        <Courses />
                    </RequireAuth>
                ),
            },
            {
                path: 'course/:courseId?',
                element: (
                    <RequireAuth>
                        <Course />
                    </RequireAuth>
                ),
            },
            {
                path: 'exercise/:exerciseId?',
                element: (
                    <RequireAuth>
                        <Exercise />
                    </RequireAuth>
                ),
            },
            {
                path: 'submission/:submissionId?',
                element: (
                    <RequireAuth>
                        <Submission />
                    </RequireAuth>
                ),
            },
        ],
    },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
