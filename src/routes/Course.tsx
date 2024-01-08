import { Paper, SxProps, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getCourse, getCourseTree } from '../app/api/course';
import { CourseData, CourseTree } from '../app/api/courseTypes';
import { parseTitle } from '../app/util';

const Course = (): JSX.Element => {
    const navigate = useNavigate();
    const theme = useTheme();
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

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        ':visited': { color: 'linktext' },
        display: 'block',
    };

    if (course === null || courseTree === null) return <Typography>{t('loading-course')}</Typography>;
    return (
        <>
            <Typography variant="h2">{parseTitle(course.name, language)}</Typography>
            <Paper sx={{ p: theme.spacing(3), pt: `calc(${theme.spacing(3)} - 10px)` }}>
                {courseTree.modules.map((module) => (
                    <div key={`module-${module.id}`} style={{ paddingTop: 10 }}>
                        <Typography variant="h4" component={Link} to={`/course/${courseId}/${module.id}`} sx={linkSx}>
                            {module.name}
                        </Typography>
                        {module.children.map((item) => (
                            <Typography
                                key={`module-${item.id}`}
                                sx={{ ...linkSx, pl: '32px', pt: '10px' }}
                                component={Link}
                                to={`/course/${courseId}/${module.id}/${item.id}`}
                            >
                                {parseTitle(item.name, language)}
                            </Typography>
                        ))}
                    </div>
                ))}
            </Paper>
        </>
    );
};

export default Course;
