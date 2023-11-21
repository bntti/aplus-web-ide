import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiTokenContext, UserContext } from '../app/StateProvider';

type CoursesT = {
    count: number;
    results: { id: number; name: string }[];
};

const Courses = (): JSX.Element => {
    const { apiToken } = useContext(ApiTokenContext);
    const { user } = useContext(UserContext);

    const [courses, setCourses] = useState<CoursesT | null>(null);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get('/api/v2/courses', { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setCourses(response.data);
            })
            .catch(console.error);
    }, [apiToken]);

    if (apiToken === null) return <></>;
    if (user === null || courses === null) return <Typography>Loading courses...</Typography>;
    return (
        <TableContainer component={Paper}>
            <Table component="div">
                <TableBody component="div">
                    {user.enrolled_courses.map((course) => (
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
