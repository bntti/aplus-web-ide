import { Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from './StateProvider';
import Root from '../components/Root';
import Course from '../routes/Course';
import Exercise from '../routes/Exercise';
import Home from '../routes/Home';
import Login from '../routes/Login';
import Logout from '../routes/Logout';
import Submission from '../routes/Submission';

declare global {
    interface Window {
        MathJax?: {
            typeset: () => void;
        };
    }
}

const RequireAuth = ({ children }: { children: JSX.Element }): JSX.Element => {
    const { apiToken, setApiToken } = useContext(ApiTokenContext);
    const { user, setUser } = useContext(UserContext);
    const { graderToken, setGraderToken } = useContext(GraderTokenContext);

    const storageApiToken = localStorage.getItem('apiToken');
    const storageUser = localStorage.getItem('user');
    const storageGraderToken = localStorage.getItem('graderToken');

    useEffect(() => {
        if (apiToken && user && graderToken) return; // Race condition? (shouldn't be a problem)
        if (storageApiToken && storageUser && storageGraderToken) {
            setApiToken(storageApiToken);
            setUser(JSON.parse(storageUser));
            setGraderToken(storageGraderToken);
        }
    }, [
        apiToken,
        user,
        graderToken,
        storageApiToken,
        storageUser,
        storageGraderToken,
        setApiToken,
        setUser,
        setGraderToken,
    ]);

    if (apiToken && user && graderToken) return children;
    if (storageApiToken && storageUser && storageGraderToken) return <Typography>Loading</Typography>;

    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            { path: 'login', element: <Login /> },
            { path: 'logout', element: <Logout /> },
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
