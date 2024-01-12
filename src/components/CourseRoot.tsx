import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLoaderData } from 'react-router-dom';

import { LanguageContext } from '../app/StateProvider';
import { CourseData, CourseTree } from '../app/api/courseTypes';
import { parseTitle } from '../app/util';

type LoaderData = { course: CourseData; courseTree: CourseTree };
export type CourseContext = LoaderData;

const CourseRoot = (): JSX.Element => {
    const { t } = useTranslation();
    const { language } = useContext(LanguageContext);
    const { course, courseTree } = useLoaderData() as LoaderData;

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
