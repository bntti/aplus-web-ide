import { Paper, SxProps, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';

import { LanguageContext } from '../app/StateProvider';
import { parseTitle } from '../app/util';
import { CourseContext } from '../components/CourseRoot';

const Course = (): JSX.Element => {
    const theme = useTheme();
    const { courseTree } = useOutletContext<CourseContext>();
    const { courseId } = useParams();

    const { language } = useContext(LanguageContext);

    const linkSx: SxProps = {
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        ':visited': { color: 'linktext' },
        display: 'block',
    };

    return (
        <>
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
