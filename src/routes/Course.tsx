import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Done';
import {
    Chip,
    Container,
    Divider,
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
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { ApiTokenContext } from '../app/StateProvider';

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

    useEffect(() => {
        const getData = async (): Promise<void> => {
            const courseResponse = await axios.get(`/api/v2/courses/${courseId}`, {
                headers: { Authorization: `Token ${apiToken}` },
            });

            setCourse(CourseSchema.parse(courseResponse.data));

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
        };
        getData().catch(console.error);
    }, [apiToken, courseId]);

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        return matches ? matches[1] + matches[2] : name;
    };

    if (apiToken === null) return <Navigate replace to="/courses" />;
    if (course === null || coursePoints === null || exerciseMaxSubmissions === null) {
        return <Typography>Loading course...</Typography>;
    }

    const totalMaxPoints = coursePoints.modules.reduce((total, module) => total + module.max_points, 0);
    return (
        <>
            <Typography variant="h2">{parseName(course.name)}</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3.5 }}>
                <Typography variant="h6">Total points</Typography>
                <Chip
                    label={`${coursePoints.points} / ${totalMaxPoints}`}
                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            </Stack>

            {coursePoints.modules
                .filter((module) => module.exercises.length > 0)
                .map((module) => (
                    <Container key={module.name} component={Paper} sx={{ mb: 5, pt: 3, pb: 2.5 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            {parseName(module.name)}
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{ mb: 2 }}
                            divider={<Divider orientation="vertical" flexItem />}
                        >
                            {module.passed ? (
                                <Typography color="success.main">Passed</Typography>
                            ) : module.points < module.points_to_pass ? (
                                <Typography>Points required to pass {module.points_to_pass}</Typography>
                            ) : (
                                <Typography>Some exercises not passed</Typography>
                            )}
                            <Stack direction="row" spacing={1}>
                                <Typography>Points</Typography>
                                <Chip
                                    size="small"
                                    label={`${module.points} / ${module.max_points}`}
                                    color={
                                        module.points < module.points_to_pass
                                            ? 'error'
                                            : module.points < module.max_points
                                              ? 'warning'
                                              : 'success'
                                    }
                                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                />
                            </Stack>
                        </Stack>
                        <TableContainer>
                            <Table component="div" size="small">
                                <TableHead component="div">
                                    <TableRow component="div">
                                        <TableCell component="div">
                                            <Typography>Exercise</Typography>
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>Passed</Typography>
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
                                            sx={{
                                                textDecoration: 'none',
                                                '&:last-child div.MuiTableCell-root': {
                                                    borderBottom: 0,
                                                },
                                            }}
                                        >
                                            <TableCell component="div" sx={{ width: '70%' }}>
                                                <Typography>{parseName(exercise.name)}</Typography>
                                            </TableCell>
                                            <TableCell component="div" align="right">
                                                {exercise.passed ? (
                                                    <CheckIcon color="success" />
                                                ) : (
                                                    <CloseIcon color="error" />
                                                )}
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
