import { Breadcrumbs, SxProps, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, LanguageContext } from '../app/StateProvider';
import { CourseTreeChapter, CourseTreeModule } from '../app/api/courseTypes';
import { getMaterialHtml } from '../app/api/exercise';
import { parseTitle } from '../app/util';
import { CourseContext } from '../components/CourseRoot';
import Exercise from '../components/Exercise';

const CoursePage = (): JSX.Element => {
    const { courseTree, course } = useOutletContext<CourseContext>();
    const { courseId, moduleId, chapterId } = useParams();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { graderToken } = useContext(GraderTokenContext);
    const { language } = useContext(LanguageContext);

    const [dataChapterId, setDataChapterid] = useState<number>(-1);
    const [chapterHtml, setChapterHtml] = useState<string[] | null>(null);

    const getCourseParentItem = useCallback(
        (items: CourseTreeModule[]): CourseTreeModule | null => {
            if (!moduleId) return null;
            for (const rootItem of items) {
                if (rootItem.id === parseInt(moduleId)) return rootItem;
                continue;
            }
            return null;
        },
        [moduleId],
    );
    const getCourseChapterItem = useCallback(
        (items: CourseTreeChapter[]): CourseTreeChapter | null => {
            if (!chapterId) return null;
            for (const chapterItem of items) {
                if (chapterItem.id === parseInt(chapterId)) return chapterItem;
            }
            return null;
        },
        [chapterId],
    );

    useEffect(() => {
        if (chapterId === undefined || dataChapterId === parseInt(chapterId as string)) return;

        const getData = async (): Promise<void> => {
            if (apiToken === null || courseId === undefined || graderToken === null) return;

            const parentItem = getCourseParentItem(courseTree.modules);
            if (!parentItem) throw new Error('Failed to find module from tree');
            const chapterItem = getCourseChapterItem(parentItem.children);
            if (!chapterItem) throw new Error('Failed to find chapter from tree');

            let cleanTitle = parseTitle(chapterItem.name, 'english');
            if (cleanTitle.match(/\d\.\d/)) cleanTitle = cleanTitle.split(' ').slice(1).join(' ');
            const newMaterial = await getMaterialHtml(graderToken, cleanTitle);

            setChapterHtml(newMaterial);
            setDataChapterid(parseInt(chapterId as string));
        };
        getData().catch(console.error);
    }, [
        apiToken,
        chapterHtml,
        chapterId,
        course,
        courseId,
        courseTree,
        dataChapterId,
        getCourseChapterItem,
        getCourseParentItem,
        graderToken,
        moduleId,
    ]);

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        color: 'linktext',
    };

    if (!moduleId) return <Navigate to={`/course/${courseId}`} />;
    if (course === null || courseTree === null) return <Typography>{t('loading-page')}</Typography>;

    const parentItem = getCourseParentItem(courseTree.modules);
    if (!parentItem) return <Navigate to={`/course/${courseId}`} />;

    if (!chapterId) {
        return (
            <>
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
                        to={`/course/${courseId}/${moduleId}/${item.id}`}
                    >
                        {parseTitle(item.name, language)}
                    </Typography>
                ))}
            </>
        );
    }

    const chapterItem = getCourseChapterItem(parentItem.children);
    if (!chapterItem) return <Navigate to={`/course/${courseId}`} />;
    if (chapterHtml === null) return <Typography>{t('loading-page')}</Typography>;
    return (
        <>
            <Breadcrumbs>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}`}>
                    {parseTitle(course.name, language)}
                </Typography>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}/${moduleId}`}>
                    {parseTitle(parentItem.name, language)}
                </Typography>
                <Typography color="text.primary">{parseTitle(chapterItem.name, language)}</Typography>
            </Breadcrumbs>
            <Typography variant="h4">{chapterItem.name}</Typography>
            {chapterHtml.map((html, index) => (
                <div key={`exercise-${index}`}>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                    {index < chapterItem.children.length && <Exercise exerciseId={chapterItem.children[index].id} />}
                </div>
            ))}
        </>
    );
};

export default CoursePage;
