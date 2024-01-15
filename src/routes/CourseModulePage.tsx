import { Breadcrumbs, SxProps, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';

import { LanguageContext } from '../app/StateProvider';
import { parseTitle } from '../app/util';
import { CourseContext } from '../components/CourseRoot';

const CourseModulePage = (): JSX.Element => {
    const { courseId, moduleId } = useParams();
    const { language } = useContext(LanguageContext);
    const { courseTree, course } = useOutletContext<CourseContext>();

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        color: 'linktext',
    };

    if (!moduleId) return <Navigate to={`/course/${courseId}`} />;
    const module = courseTree.modules.find((moduleItem) => moduleItem.id === parseInt(moduleId));
    if (!module) return <Navigate to={`/course/${courseId}`} />;

    return (
        <>
            <Breadcrumbs sx={{ mt: 2 }}>
                <Typography sx={{ ...linkSx }} component={Link} to={`/course/${courseId}`}>
                    {parseTitle(course.name, language)}
                </Typography>
                <Typography color="text.primary">{parseTitle(module.name, language)}</Typography>
            </Breadcrumbs>
            <Typography variant="h4">{module.name}</Typography>
            {module.children.map((item) => (
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
};

export default CourseModulePage;
