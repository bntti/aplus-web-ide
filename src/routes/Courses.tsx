import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';

type CoursesT = {
    count: number;
    results: { id: number; name: string }[];
};

const Courses = (): JSX.Element => {
    const apiToken = useSelector(selectApiToken);
    const [courses, setCourses] = useState<CoursesT | null>(null);

    useEffect(() => {
        if (apiToken === '') return;
        axios
            .get('/api/v2/courses', { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setCourses(response.data);
            })
            .catch(console.error);
    }, [apiToken]);

    if (apiToken === '') return <Typography>No api token</Typography>;
    if (courses === null) return <Typography>Loading courses...</Typography>;
    return (
        <TableContainer component={Paper}>
            <Table component="div">
                <TableBody component="div">
                    {courses.results.map((course) => (
                        <TableRow
                            key={course.id}
                            component={Link}
                            to={`/course/${course.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <TableCell component="div">
                                <Typography>{course.name}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Courses;
