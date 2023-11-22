import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';

type CourseT = {
    id: number;
    name: string;
};
type Exercises = {
    results: { id: number; display_name: string; exercises: { id: number; display_name: string }[] }[];
};

const Course = (): JSX.Element => {
    const { courseId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);

    const [course, setCourse] = useState<CourseT | null>(null);
    const [exercises, setExercises] = useState<Exercises | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean>(true);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get(`/api/v2/courses/${courseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then(async (response) => {
                setCourse(response.data);
                setHasAccess(true);
                const exerciseResponse = await axios.get(`/api/v2/courses/${courseId}/exercises`, {
                    headers: { Authorization: `Token ${apiToken}` },
                });
                setExercises(exerciseResponse.data);
                setHasAccess(true);
            })
            .catch((error: AxiosError) => {
                if (error.response && error.response.request.status === 403) setHasAccess(false);
                else console.error(error);
            });
    }, [apiToken, courseId]);

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        return matches ? matches[1] + matches[2] : name;
    };

    if (apiToken === null) return <Navigate replace to="/courses" />;
    if (!hasAccess) return <Typography>You don't have access to this course</Typography>;
    if (course === null || exercises === null) return <Typography>Loading course...</Typography>;
    return (
        <>
            <Typography variant="h2">{parseName(course.name)}</Typography>

            {exercises.results
                .filter((exercise) => exercise.exercises.length > 0)
                .map((exercise) => (
                    <div key={exercise.id}>
                        <Typography variant="h5" sx={{ mb: 2, mt: 2, ml: 1 }}>
                            {exercise.display_name}
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table component="div">
                                <TableBody component="div">
                                    {exercise.exercises.map((exercise2) => (
                                        <TableRow
                                            key={exercise2.id}
                                            component={Link}
                                            to={`/exercise/${exercise2.id}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <TableCell component="div">
                                                <Typography>{parseName(exercise2.display_name)}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                ))}
        </>
    );
};

export default Course;
