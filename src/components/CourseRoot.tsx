import { Button, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useParams } from 'react-router-dom';

const CourseRoot = (): JSX.Element => {
    const { courseId } = useParams();
    const { t } = useTranslation();

    return (
        <>
            <ButtonGroup sx={{ mb: 3 }}>
                <Button size="large" variant="outlined" component={Link} to={`/course/${courseId}`}>
                    {t('course')}
                </Button>
                <Button size="large" variant="outlined" component={Link} to={`/course/${courseId}/points`}>
                    {t('course-points')}
                </Button>
            </ButtonGroup>

            <Outlet />
        </>
    );
};

export default CourseRoot;
