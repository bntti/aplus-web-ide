import { Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { ApiTokenContext, UserContext } from '../app/StateProvider';

const Courses = (): JSX.Element => {
    const { user } = useContext(UserContext);
    const { apiToken } = useContext(ApiTokenContext);

    if (apiToken === null || user === null) return <Navigate replace to="/login" />;
    return (
        <Grid container spacing={10}>
            {user.enrolled_courses.map((course) => (
                <Grid xs={4} item key={course.id} style={{ textDecoration: 'none' }}>
                    <Card>
                        <CardActionArea component={Link} to={`/course/${course.id}`} sx={{ height: 200 }}>
                            <CardContent>
                                <Typography variant="h5">{course.name}</Typography>
                                <Typography sx={{ mt: 1.5 }}>{course.instance_name}</Typography>
                                <Typography sx={{}} variant="body2" color="text.secondary">
                                    {course.code}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default Courses;
