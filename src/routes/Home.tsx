import { Box, Card, CardActionArea, CardContent, Divider, Typography } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { UserContext } from '../app/StateProvider';

const Home = (): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useContext(UserContext);

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

                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {user.enrolled_courses.map((course) => (
                            <Card key={`course-card-${course.id}`} sx={{ mr: 2, mb: 2 }}>
                                <CardActionArea
                                    component={Link}
                                    to={`/course/${course.id}`}
                                    sx={{ height: 200, width: 250 }}
                                >
                                    <CardContent>
                                        <Typography variant="h4">{course.name}</Typography>
                                        <Typography sx={{ mt: 1.5 }}>{course.instance_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {course.code}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>
                </>
            )}
        </>
    );
};

export default Home;
