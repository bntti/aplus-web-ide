import {
    Chip,
    Container,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';
import { z } from 'zod';

const CourseSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
});
type CourseT = z.infer<typeof CourseSchema>;

const CoursePointsSchema = z.object({
    points: z.number().int().nonnegative(),
    modules: z.array(
        z.object({
            name: z.string(),
            max_points: z.number().int().nonnegative(),
            points_to_pass: z.number().int().nonnegative(),
            submission_count: z.number().int().nonnegative(),
            points: z.number().int().nonnegative(),
            passed: z.boolean(),
            exercises: z.array(
                z.object({
                    id: z.number().int().nonnegative(),
                    name: z.string(),
                    max_points: z.number().int().nonnegative(),
                    points_to_pass: z.number().int().nonnegative(),
                    submission_count: z.number().int().nonnegative(),
                    points: z.number().int().nonnegative(),
                    passed: z.boolean(),
                }),
            ),
        }),
    ),
});
type CoursePoints = z.infer<typeof CoursePointsSchema>;

// TODO: Has fields next and previous, might be necessary on bigger courses?
const ExercisesSchema = z.object({
    results: z.array(
        z.object({
            exercises: z.array(
                z.object({ id: z.number().int().nonnegative(), max_submissions: z.number().int().nonnegative() }),
            ),
        }),
    ),
});

const Course = (): JSX.Element => {
    const { courseId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const theme = useTheme();

    const [course, setCourse] = useState<CourseT | null>(null);
    const [coursePoints, setCoursePoints] = useState<CoursePoints | null>(null);
    const [exerciseMaxSubmissions, setExerciseMaxSubmissions] = useState<{ [key: number]: number } | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean>(true);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get(`/api/v2/courses/${courseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then(async (response) => {
                setHasAccess(true);
                setCourse(CourseSchema.parse(response.data));

                const exerciseResponse = await axios.get(`/api/v2/courses/${courseId}/exercises`, {
                    headers: { Authorization: `Token ${apiToken}` },
                });
                const exercises = ExercisesSchema.parse(exerciseResponse.data);
                const maxSubmissions: { [key: number]: number } = {};
                for (const result of exercises.results) {
                    for (const exercise of result.exercises) {
                        maxSubmissions[exercise.id] = exercise.max_submissions;
                    }
                }
                setExerciseMaxSubmissions(maxSubmissions);

                const pointsResponse = await axios.get(`/api/v2/courses/${courseId}/points/me`, {
                    headers: { Authorization: `Token ${apiToken}` },
                });
                setCoursePoints(CoursePointsSchema.parse(pointsResponse.data));
            })
            .catch((error: AxiosError) => {
                if (error.response && error.response.request.status === 403) setHasAccess(false);
                else console.error(error);
            });
    }, [apiToken, courseId]);

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        return matches ? matches[1] + matches[2] : name;
    };

    if (apiToken === null) return <Navigate replace to="/courses" />;
    if (!hasAccess) return <Typography>You don't have access to this course</Typography>;
    if (course === null || coursePoints === null || exerciseMaxSubmissions === null) {
        return <Typography>Loading course...</Typography>;
    }

    const totalMaxPoints = coursePoints.modules.reduce((total, module) => total + module.max_points, 0);
    return (
        <>
            <Typography variant="h2">{parseName(course.name)}</Typography>
            <Typography variant="h6" sx={{ mb: 5 }}>
                Total points{' '}
                <Chip
                    label={`${coursePoints.points} / ${totalMaxPoints}`}
                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            </Typography>

            {coursePoints.modules
                .filter((module) => module.exercises.length > 0)
                .map((module) => (
                    <Container key={module.name} component={Paper} sx={{ mb: 5, pt: 3, pb: 3 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            {parseName(module.name)}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Typography>
                                Points required to pass{' '}
                                <Chip
                                    size="small"
                                    label={`${module.points} / ${module.points_to_pass}`}
                                    color={module.passed ? 'success' : 'error'}
                                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                />
                            </Typography>
                            <Typography>
                                Points{' '}
                                <Chip
                                    size="small"
                                    label={`${module.points} / ${module.max_points}`}
                                    color={module.points < module.max_points ? 'warning' : 'success'}
                                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                />
                            </Typography>
                        </Stack>
                        <TableContainer>
                            <Table component="div">
                                <TableHead component="div">
                                    <TableRow component="div">
                                        <TableCell component="div">
                                            <Typography>Exercise</Typography>
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>Submissions</Typography>
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>Points</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody component="div">
                                    {module.exercises.map((exercise) => (
                                        <TableRow
                                            key={exercise.id}
                                            component={Link}
                                            to={`/exercise/${exercise.id}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <TableCell component="div" sx={{ width: '70%' }}>
                                                <Typography>{parseName(exercise.name)}</Typography>
                                            </TableCell>
                                            <TableCell component="div" align="right">
                                                <Chip
                                                    label={`${exercise.submission_count} / ${
                                                        exerciseMaxSubmissions[exercise.id]
                                                    }`}
                                                    disabled={
                                                        exercise.submission_count ===
                                                        exerciseMaxSubmissions[exercise.id]
                                                    }
                                                    color="default"
                                                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell component="div" align="right">
                                                <Chip
                                                    label={`${exercise.points} / ${exercise.max_points}`}
                                                    disabled={
                                                        exercise.submission_count ===
                                                        exerciseMaxSubmissions[exercise.id]
                                                    }
                                                    color={
                                                        exercise.submission_count === 0
                                                            ? 'default'
                                                            : exercise.points === 0 && exercise.max_points > 0
                                                              ? 'error'
                                                              : exercise.points < exercise.max_points
                                                                ? 'warning'
                                                                : 'success'
                                                    }
                                                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Container>
                ))}
        </>
    );
};

export default Course;
