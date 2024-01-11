import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getCourse, getCourseTree } from '../app/api/course';
import { CourseData, CourseTree } from '../app/api/courseTypes';
import { parseTitle } from '../app/util';

export type CourseContext = { course: CourseData; courseTree: CourseTree };

const CourseRoot = (): JSX.Element => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { t } = useTranslation();
    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);

    const [course, setCourse] = useState<CourseData | null>(null);
    const [courseTree, setCourseTree] = useState<CourseTree | null>(null);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || courseId === undefined) return;
            const newCourse = await getCourse(apiToken, courseId, navigate);
            const newCourseTree = await getCourseTree(apiToken, courseId, navigate);

            setCourse(newCourse);
            setCourseTree(newCourseTree);
        };
        getData().catch(console.error);
    }, [apiToken, courseId, navigate]);

    if (course === null || courseTree === null) return <Typography>{t('loading-course')}</Typography>;
    return (
        <>
            <Typography variant="h2">{parseTitle(course.name, language)}</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={window.location.pathname.startsWith(`/course/${course.id}/points`) ? 'points' : 'course'}>
                    <Tab component={Link} to={`/course/${course.id}`} value="course" label={t('course')} />
                    <Tab
                        component={Link}
                        to={`/course/${course.id}/points`}
                        value="points"
                        label={t('course-points')}
                    />
                </Tabs>
            </Box>

            <Outlet context={{ course, courseTree }} />
        </>
    );
};

export default CourseRoot;
