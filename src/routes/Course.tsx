import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';
import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

type CourseT = {
    id: number;
    name: string;
};

type Exercises = {
    results: { id: number; display_name: string; exercises: { id: number; display_name: string }[] }[];
};

const Course = (): JSX.Element => {
    const { courseId } = useParams();

    const apiToken = useSelector(selectApiToken);
    const [course, setCourse] = useState<CourseT | null>(null);
    const [exercises, setExercises] = useState<Exercises | null>(null);

    useEffect(() => {
        if (apiToken === '') return;
        axios
            .get(`/api/v2/courses/${courseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                const newCourse = response.data;
                setCourse(newCourse);
            })
            .catch(console.error);
        axios
            .get(`/api/v2/courses/${courseId}/exercises`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                const newExercises = response.data;
                setExercises(newExercises);
            })
            .catch(console.error);
    }, [apiToken, courseId]);

    if (apiToken === '') return <Typography>No api token</Typography>;
    return (
        <>
            {course === null || exercises === null ? (
                <Typography>Loading course...</Typography>
            ) : (
                <>
                    <Typography variant="h2">{course.name}</Typography>

                    {exercises.results
                        .filter((exercise) => exercise.exercises.length > 0)
                        .map((exercise) => (
                            <div key={exercise.id}>
                                <br />
                                <Typography variant="h5">{exercise.display_name}</Typography>
                                <br />
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
                                                        <Typography>{exercise2.display_name}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        ))}
                </>
            )}
        </>
    );
};

export default Course;
