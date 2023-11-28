import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography,
    useTheme,
} from '@mui/material';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ApiTokenContext } from '../app/StateProvider';
import CodeEditor from '../components/CodeEditor';
import FormExercise from '../components/FormExercise';
import { ExerciseSchema, ExerciseT, ExerciseWithInfo } from './exerciseTypes';
import TabPanel from '../components/TabPanel';

const SubmissionsSchema = z.object({
    submissions_with_points: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            submission_time: z.string().datetime({ precision: 6 }).pipe(z.coerce.date()),
            grade: z.number().int().nonnegative(),
        }),
    ),
    points_to_pass: z.number().int().nonnegative(),
    points: z.number().int().nonnegative(),
    passed: z.boolean(),
});

type Submissions = z.infer<typeof SubmissionsSchema>;

const Exercise = (): JSX.Element => {
    const { state } = useLocation();
    const { exerciseId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const navigate = useNavigate();
    const theme = useTheme();

    const [exercise, setExercise] = useState<ExerciseT | null>(null);
    const [submissions, setSubmissions] = useState<Submissions | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const getSubmissions = useCallback((): void => {
        axios
            .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then((response) => {
                setSubmissions(SubmissionsSchema.parse(response.data));
            })
            .catch(console.error);
    }, [apiToken, exerciseId]);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get(`/api/v2/exercises/${exerciseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setExercise(ExerciseSchema.parse(response.data));
            })
            .catch(console.error);
        getSubmissions();
    }, [apiToken, exerciseId, getSubmissions]);

    useEffect(() => {
        if (state && state.showSubmissions && activeIndex !== 1) {
            setActiveIndex(1);
            state.showSubmissions = false;
        }
    }, [state, activeIndex]);

    const callback = (): void => {
        getSubmissions();
        setActiveIndex(1);
    };

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        return matches ? matches[1] + matches[2] : name;
    };

    const numSubmissions = submissions ? submissions.submissions_with_points.length : 0;

    if (apiToken === null || exerciseId === undefined) return <Navigate replace to="/courses" />;
    if (exercise !== null && !exercise.is_submittable) return <Typography>Exercise is not submittable?</Typography>;
    if (exercise === null || submissions === null) return <Typography>Loading exercise...</Typography>;

    return (
        <>
            <Typography variant="h4">{parseName(exercise.display_name)}</Typography>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                divider={<Divider orientation="vertical" flexItem />}
            >
                {numSubmissions > 0 ? (
                    <Typography>
                        Submissions done {numSubmissions}/{exercise.max_submissions}
                    </Typography>
                ) : (
                    <Typography>Max submissions {exercise.max_submissions}</Typography>
                )}
                {submissions.passed ? (
                    <Typography color="success.main">Passed</Typography>
                ) : (
                    <Typography>Points required to pass {submissions.points_to_pass}</Typography>
                )}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Button variant="outlined" size="small" onClick={() => navigate(`/course/${exercise.course.id}`)}>
                    Back to course
                </Button>
                <Chip
                    sx={{ mt: 0.5 }}
                    label={`${submissions.points} / ${exercise.max_points}`}
                    color={
                        numSubmissions === 0
                            ? 'default'
                            : submissions.points === 0 && exercise.max_points > 0
                              ? 'error'
                              : submissions.points < exercise.max_points
                                ? 'warning'
                                : 'success'
                    }
                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            </Stack>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeIndex} onChange={(_, value) => setActiveIndex(value)}>
                    <Tab label="Edit code" />
                    <Tab label="Submissions" />
                </Tabs>
            </Box>

            <TabPanel value={activeIndex} index={0}>
                {exercise.exercise_info === null ? (
                    <Typography>Exercise submission type info unavailable</Typography>
                ) : numSubmissions >= exercise.max_submissions ? (
                    <Typography>All {exercise.max_submissions} submissions done.</Typography>
                ) : exercise.exercise_info.form_spec[0].type === 'file' ? (
                    <CodeEditor callback={callback} exercise={exercise as ExerciseWithInfo} />
                ) : (
                    <FormExercise exercise={exercise as ExerciseWithInfo} apiToken={apiToken} callback={callback} />
                )}
            </TabPanel>

            <TabPanel value={activeIndex} index={1}>
                {submissions.submissions_with_points.length === 0 ? (
                    <Typography>No submissions</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                        <Table component="div">
                            <TableHead component="div">
                                <TableCell component="div">Submission #</TableCell>
                                <TableCell component="div">Score</TableCell>
                                <TableCell component="div" align="right">
                                    Submission time
                                </TableCell>
                            </TableHead>
                            <TableBody component="div">
                                {submissions.submissions_with_points.map((submission, index) => (
                                    <TableRow
                                        key={submission.id}
                                        component={Link}
                                        to={`/submission/${submission.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <TableCell component="div">
                                            <Typography>{numSubmissions - index}</Typography>
                                        </TableCell>
                                        <TableCell component="div">
                                            <Chip
                                                label={`${submission.grade} / ${exercise.max_points}`}
                                                color={
                                                    submission.grade === 0 && exercise.max_points > 0
                                                        ? 'error'
                                                        : submission.grade < exercise.max_points
                                                          ? 'warning'
                                                          : 'success'
                                                }
                                                variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>{submission.submission_time.toLocaleString()}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </TabPanel>
        </>
    );
};

export default Exercise;
