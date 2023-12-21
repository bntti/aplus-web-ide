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
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { CourseData, CoursePoints, getCourse, getCoursePoints, getExercises } from '../app/api/course';
import PointsChip from '../components/PointsChip';

const Course = (): JSX.Element => {
    const { courseId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);
    const theme = useTheme();
    const navigate = useNavigate();

    const [course, setCourse] = useState<CourseData | null>(null);
    const [coursePoints, setCoursePoints] = useState<CoursePoints | null>(null);
    const [exerciseMaxSubmissions, setExerciseMaxSubmissions] = useState<{ [key: number]: number } | null>(null);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || courseId === undefined) return;
            setCourse(await getCourse(apiToken, courseId, navigate));
            setCoursePoints(await getCoursePoints(apiToken, courseId, navigate));

            const exercises = await getExercises(apiToken, courseId, navigate);
            const maxSubmissions: { [key: number]: number } = {};
            for (const result of exercises.results) {
                for (const exercise of result.exercises) {
                    maxSubmissions[exercise.id] = exercise.max_submissions;
                }
            }
            setExerciseMaxSubmissions(maxSubmissions);
        };
        getData().catch(console.error);
    }, [apiToken, courseId, navigate]);

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        if (language === 'english') return matches ? matches[1] + matches[2] : name;
        else if (language === 'finnish') return matches ? matches[1] + matches[3] : name;
        throw new Error(`Invalid language ${language}`);
    };

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
                                <PointsChip points={module.points} maxPoints={module.max_points} size="small" />
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
                                                <PointsChip
                                                    points={exercise.points}
                                                    maxPoints={exercise.max_points}
                                                    disabled={
                                                        exercise.submission_count ===
                                                        exerciseMaxSubmissions[exercise.id]
                                                    }
                                                    gray={exercise.submission_count === 0}
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
