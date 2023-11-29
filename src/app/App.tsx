import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';

import Root from '../components/Root';
import Course from '../routes/Course';
import Courses from '../routes/Courses';
import Exercise from '../routes/Exercise';
import Login from '../routes/Login';
import Submission from '../routes/Submission';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                index: true,
                loader: () => redirect('/courses'),
            },
            { path: 'login', element: <Login /> },

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
