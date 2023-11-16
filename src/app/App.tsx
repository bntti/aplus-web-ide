import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectApiToken, setApiToken } from './state/apiToken';

type Courses = {
    count: number;
    results: { id: number; name: string }[];
};

const App = (): JSX.Element => {
    const apiToken = useSelector(selectApiToken);
    const dispatch = useDispatch();
    const [newApiToken, setNewApiToken] = useState('');
    const [courses, setCourses] = useState<Courses>({ count: 0, results: [] });

    const addApiToken = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        dispatch(setApiToken(newApiToken));
    };

    useEffect(() => {
        if (apiToken === '') return;
        axios
            .get('/api/v2/courses', { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                const newCourses = response.data;
                console.log(newCourses);
                setCourses(newCourses);
            })
            .catch(console.error);
    }, [apiToken]);

    return (
        <>
            <form onSubmit={addApiToken}>
                <input value={newApiToken} onChange={(event) => setNewApiToken(event.target.value)} />
                <button type="submit">save</button>
            </form>
            {courses.results.map((course) => (
                <a href={`/courses/${course.id}`}>{course.name}</a>
            ))}
        </>
    );
};

export default App;
