import { Card, CardActionArea, CardContent, Divider, Grid, Typography } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { UserContext } from '../app/StateProvider';

const Home = (): JSX.Element => {
    const { user } = useContext(UserContext);
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="h3">A+</Typography>
            <Divider sx={{ mb: 2 }} />

            {user === null ? (
                <Typography variant="h5">{t('not-logged-in')}</Typography>
            ) : (
                <>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                        {t('my-courses')}
                    </Typography>

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
                </>
            )}
        </>
    );
};

export default Home;
