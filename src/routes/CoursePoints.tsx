import { Chip, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext } from 'react-router-dom';

import { CoursePointsData, Exercises } from '../app/api/courseTypes';
import CourseModule from '../components/CourseModule';
import { CourseContext } from '../components/CourseRoot';

type LoaderData = { coursePoints: CoursePointsData; exercises: Exercises };

const CoursePoints = (): JSX.Element => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { coursePoints, exercises } = useLoaderData() as LoaderData;
    const { courseTree, course } = useOutletContext<CourseContext>();

    const maxSubmissions: { [key: number]: number } = {};
    for (const result of exercises.results) {
        for (const exercise of result.exercises) {
            maxSubmissions[exercise.id] = exercise.max_submissions;
        }
    }
    const exercisePaths: { [key: number]: string } = {};
    for (const module of courseTree.modules) {
        for (const chapter of module.children) {
            for (const exercise of chapter.children) {
                exercisePaths[exercise.id] = `${course.id}/${module.id}/${chapter.id}/#${exercise.id}`;
            }
        }
    }

    const totalMaxPoints = coursePoints.modules.reduce((total, module) => total + module.max_points, 0);
    return (
        <>
            <Stack direction="row" spacing={1} sx={{ mb: 3.5, mt: 2 }}>
                <Typography variant="h6">{t('total-points')}</Typography>
                <Chip
                    label={`${coursePoints.points} / ${totalMaxPoints}`}
                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            </Stack>

            {coursePoints.modules
                .filter((module) => module.exercises.length > 0)
                .map((module) => (
                    <CourseModule
                        key={module.name}
                        module={module}
                        exerciseMaxSubmissions={maxSubmissions}
                        exercisePaths={exercisePaths}
                    />
                ))}
        </>
    );
};

export default CoursePoints;
