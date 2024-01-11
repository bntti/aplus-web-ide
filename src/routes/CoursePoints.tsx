import { Chip, Stack, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getCoursePoints, getExercises } from '../app/api/course';
import { CoursePointsData } from '../app/api/courseTypes';
import { parseTitle } from '../app/util';
import CourseModule from '../components/CourseModule';
import { CourseContext } from '../components/CourseRoot';

const CoursePoints = (): JSX.Element => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { courseTree, course } = useOutletContext<CourseContext>();
    const { courseId } = useParams();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);

    const [coursePoints, setCoursePoints] = useState<CoursePointsData | null>(null);
    const [exerciseMaxSubmissions, setExerciseMaxSubmissions] = useState<{ [key: number]: number } | null>(null);
    const [exercisePath, setExercisePath] = useState<{ [key: number]: string } | null>(null);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || courseId === undefined) return;
            const newCoursePoints = await getCoursePoints(apiToken, courseId, navigate);
            const exercises = await getExercises(apiToken, courseId, navigate);

            const maxSubmissions: { [key: number]: number } = {};
            for (const result of exercises.results) {
                for (const exercise of result.exercises) {
                    maxSubmissions[exercise.id] = exercise.max_submissions;
                }
            }
            const newExercisePath: { [key: number]: string } = {};
            for (const module of courseTree.modules) {
                for (const chapter of module.children) {
                    for (const exercise of chapter.children) {
                        newExercisePath[exercise.id] = `${course.id}/${module.id}/${chapter.id}`;
                    }
                }
            }

            setCoursePoints(newCoursePoints);
            setExerciseMaxSubmissions(maxSubmissions);
            setExercisePath(newExercisePath);
        };
        getData().catch(console.error);
    }, [apiToken, course.id, courseId, courseTree.modules, navigate]);

    if (course === null || coursePoints === null || exerciseMaxSubmissions === null || exercisePath === null) {
        return <Typography>{t('loading-course')}</Typography>;
    }

    const totalMaxPoints = coursePoints.modules.reduce((total, module) => total + module.max_points, 0);
    return (
        <>
            <Typography variant="h2">{parseTitle(course.name, language)}</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3.5 }}>
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
                        exerciseMaxSubmissions={exerciseMaxSubmissions}
                        exercisePath={exercisePath}
                    />
                ))}
        </>
    );
};

export default CoursePoints;
