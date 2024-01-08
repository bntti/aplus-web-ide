import { useContext } from 'react';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, UserContext } from './StateProvider';
import CourseRoot from '../components/CourseRoot';
import Root from '../components/Root';
import Course from '../routes/Course';
import CoursePage from '../routes/CoursePage';
import CoursePoints from '../routes/CoursePoints';
import Home from '../routes/Home';
import Login from '../routes/Login';
import Logout from '../routes/Logout';
import Profile from '../routes/Profile';
import Submission from '../routes/Submission';

declare global {
    interface Window {
        MathJax?: { typeset: () => void };
    }
}

const RequireAuth = ({ outlet }: { outlet: JSX.Element }): JSX.Element => {
    const { apiToken } = useContext(ApiTokenContext);
    const { graderToken } = useContext(GraderTokenContext);
    const { user } = useContext(UserContext);

    if (apiToken && user && graderToken) return outlet;
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '',
                element: <Home />,
            },
            { path: 'login', element: <Login /> },
            { path: 'logout', element: <Logout /> },
            {
                path: 'profile',
                element: <RequireAuth outlet={<Profile />} />,
            },
            {
                path: 'course/:courseId?',
                element: <CourseRoot />,
                children: [
                    {
                        path: '',
                        element: <RequireAuth outlet={<Course />} />,
                    },

                    {
                        path: 'points',
                        element: <RequireAuth outlet={<CoursePoints />} />,
                    },
                    {
                        path: ':parentChapterId?',
                        element: <RequireAuth outlet={<CoursePage />} />,
                    },
                    {
                        path: ':parentChapterId?/:chapterId',
                        element: <RequireAuth outlet={<CoursePage />} />,
                    },
                ],
            },
            {
                path: 'submission/:submissionId?',
                element: <RequireAuth outlet={<Submission />} />,
            },
        ],
    },
]);

const App = (): JSX.Element => <RouterProvider router={router} />;

export default App;
