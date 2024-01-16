import { Breadcrumbs, SxProps, Typography, useTheme } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Link, Navigate, useLoaderData, useOutletContext, useParams } from 'react-router-dom';

import { LanguageContext } from '../app/StateProvider';
import { parseTitle } from '../app/util';
import { CourseContext } from '../components/CourseRoot';
import Exercise from '../components/Exercise';

const CourseChapterPage = (): JSX.Element => {
    const theme = useTheme();
    const { courseId, moduleId, chapterId } = useParams();
    const { chapterHtml } = useLoaderData() as { chapterHtml: string[] };
    const { language } = useContext(LanguageContext);
    const { courseTree, course } = useOutletContext<CourseContext>();

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        color: 'linktext',
    };

    useEffect(() => {
        if (window.location.hash) {
            const element = document.getElementById(window.location.hash.replace('#', ''));
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    if (!moduleId || !chapterId) return <Navigate to={`/course/${courseId}`} />;
    const module = courseTree.modules.find((moduleItem) => moduleItem.id === parseInt(moduleId));
    if (!module) return <Navigate to={`/course/${courseId}`} />;

    const chapter = module.children.find((chapterItem) => chapterItem.id === parseInt(chapterId));
    if (!chapter) return <Navigate to={`/course/${courseId}`} />;
    return (
        <>
            <Breadcrumbs sx={{ mt: 2, mb: 1 }}>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}`}>
                    {parseTitle(course.name, language)}
                </Typography>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}/${moduleId}`}>
                    {parseTitle(module.name, language)}
                </Typography>
                <Typography color="text.primary">{parseTitle(chapter.name, language)}</Typography>
            </Breadcrumbs>
            <Typography variant="h4">{chapter.name}</Typography>
            {chapterHtml.map((html, index) => (
                <div key={`exercise-${index}`}>
                    <div className={`innerhtml ${theme.palette.mode}`} dangerouslySetInnerHTML={{ __html: html }} />
                    {index < chapter.children.length && (
                        <section id={chapter.children[index].id.toString()}>
                            <Exercise exerciseId={chapter.children[index].id} />
                        </section>
                    )}
                </div>
            ))}
        </>
    );
};

export default CourseChapterPage;
