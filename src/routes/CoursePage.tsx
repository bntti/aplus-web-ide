import { Breadcrumbs, SxProps, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getCourse, getCourseTree } from '../app/api/course';
import { CourseData, CourseTree, CourseTreeChapter, CourseTreeRootItem } from '../app/api/courseTypes';
import { parseTitle } from '../app/util';
import Exercise from '../components/Exercise';

const CoursePage = (): JSX.Element => {
    const navigate = useNavigate();
    const { courseId, parentChapterId, chapterId } = useParams();
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

    const getCourseParentItem = (items: CourseTreeRootItem[]): CourseTreeRootItem | null => {
        if (!parentChapterId) return null;
        for (const rootItem of items) {
            if (rootItem.id === parseInt(parentChapterId)) return rootItem;
            continue;
        }
        return null;
    };

    const getCourseChapterItem = (items: CourseTreeChapter[]): CourseTreeChapter | null => {
        if (!chapterId) return null;
        for (const chapterItem of items) {
            if (chapterItem.id === parseInt(chapterId)) return chapterItem;
        }
        return null;
    };

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        color: 'linktext',
    };

    if (!parentChapterId) return <Navigate to={`/course/${courseId}`} />;
    if (course === null || courseTree === null) return <Typography>{t('loading-page')}</Typography>;

    const parentItem = getCourseParentItem(courseTree.modules);
    if (!parentItem) return <Navigate to={`/course/${courseId}`} />;
    const chapterItem = getCourseChapterItem(parentItem.children);

    if (chapterId) {
        if (!chapterItem) return <Navigate to={`/course/${courseId}`} />;
        return (
            <>
                <Typography variant="h2">{parseTitle(course.name, language)}</Typography>
                <Breadcrumbs>
                    <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}`}>
                        {parseTitle(course.name, language)}
                    </Typography>
                    <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}/${parentChapterId}`}>
                        {parseTitle(parentItem.name, language)}
                    </Typography>
                    <Typography color="text.primary">{parseTitle(chapterItem.name, language)}</Typography>
                </Breadcrumbs>
                <Typography variant="h4">{chapterItem.name}</Typography>
                <Typography>TODO:Material</Typography>
                {chapterItem.children.map((exercise) => (
                    <div key={`exercise-${exercise.id}`}>
                        <Exercise exerciseId={exercise.id} />
                        <Typography>TODO:Material</Typography>
                    </div>
                ))}
            </>
        );
    }
    return (
        <>
            <Typography variant="h2">{parseTitle(course.name, language)}</Typography>
            <Breadcrumbs>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}`}>
                    {parseTitle(course.name, language)}
                </Typography>
                <Typography color="text.primary">{parseTitle(parentItem.name, language)}</Typography>
            </Breadcrumbs>
            <Typography variant="h4">{parentItem.name}</Typography>
            <Typography>TODO</Typography>
            {parentItem.children.map((item) => (
                <Typography
                    key={`module-${item.id}`}
                    sx={{ ...linkSx, display: 'block', pl: '32px', pt: '10px' }}
                    component={Link}
                    to={`/course/${courseId}/${parentChapterId}/${item.id}`}
                >
                    {parseTitle(item.name, language)}
                </Typography>
            ))}
        </>
    );
};

export default CoursePage;
