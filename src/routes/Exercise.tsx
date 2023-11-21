import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import {
    Box,
    Button,
    Chip,
    Paper,
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
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';

type ExerciseT = {
    display_name: string;
    is_submittable: boolean;
    max_points: number;
    max_submissions: number;
    exercise_info: { form_spec: { title: string }[] };
};

type Submissions = {
    submissions_with_points: { id: number; submission_time: string; grade: number }[];
    points: number;
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const CustomTabPanel = (props: TabPanelProps): JSX.Element => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const a11yProps = (index: number): { id: string; 'aria-controls': string } => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
};

const Exercise = (): JSX.Element => {
    const { state } = useLocation();
    const { exerciseId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const theme = useTheme();

    const [exercise, setExercise] = useState<ExerciseT | null>(null);
    const [submissions, setSubmissions] = useState<Submissions | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [code, setCode] = useState<string>('');
    const [language, setLanguage] = useState<string | null>(null);

    const getSubmissions = useCallback((): void => {
        axios
            .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then((response) => {
                setSubmissions(response.data);
            })
            .catch(console.error);
    }, [apiToken, exerciseId]);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get(`/api/v2/exercises/${exerciseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                const exerciseData: ExerciseT = response.data;
                setExercise(exerciseData);
                const filename = exerciseData.exercise_info.form_spec[0].title;
                if (filename.endsWith('.py')) {
                    setLanguage('python');
                } else if (filename.endsWith('.js')) {
                    setLanguage('javascript');
                } else {
                    setLanguage(null);
                }
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

    const submitCode = (): void => {
        const formData = new FormData();
        formData.append('file1', new Blob([code]));
        axios
            .post(`/api/v2/exercises/${exerciseId}/submissions/submit`, formData, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then(() => {
                getSubmissions();
                setActiveIndex(1);
            })
            .catch(console.error);
    };

    const baseLightTheme = EditorView.theme({
        '&.cm-editor': {
            outline: '1px solid rgba(0, 0, 0, 0.12)',
        },
        '&.cm-editor.cm-focused': {
            outline: '1px solid rgba(0, 0, 0, 0.26)',
        },
    });
    const baseDarkTheme = EditorView.theme({
        '&.cm-editor': {
            outline: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '&.cm-editor.cm-focused': {
            outline: '1px solid rgba(255, 255, 255, 0.16)',
        },
    });
    const editorLightTheme = githubLight;
    const editorDarkTheme = githubDark;
    const numSubmissions = submissions ? submissions.submissions_with_points.length : 0;

    if (apiToken === null) return <Navigate replace to="/courses" />;
    if (exercise !== null && !exercise.is_submittable) return <Typography>Exercise is not submittable?</Typography>;
    if (exercise === null || submissions === null) return <Typography>Loading exercise...</Typography>;
    return (
        <>
            <Typography variant="h3">{exercise.display_name}</Typography>
            {numSubmissions > 0 ? (
                <Typography>
                    Submissions done {numSubmissions}/{exercise.max_submissions}
                </Typography>
            ) : (
                <Typography>Max submissions {exercise.max_submissions}</Typography>
            )}
            {numSubmissions > 0 && (
                <Chip
                    sx={{ mt: 0.5, mb: 2 }}
                    label={`${submissions.points} / ${exercise.max_points}`}
                    color={
                        submissions.points === 0
                            ? 'error'
                            : submissions.points < exercise.max_points
                              ? 'warning'
                              : 'success'
                    }
                    variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    value={activeIndex}
                    onChange={(_, value) => setActiveIndex(value)}
                >
                    <Tab label="Edit code" {...a11yProps(0)} />
                    <Tab label="Submissions" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <CustomTabPanel value={activeIndex} index={0}>
                {numSubmissions < exercise.max_submissions ? (
                    <>
                        {language !== null && <Typography>Detected language {language}</Typography>}
                        <ReactCodeMirror
                            value={code}
                            height="700px"
                            onChange={(val) => {
                                setCode(val);
                            }}
                            theme={theme.palette.mode === 'dark' ? baseDarkTheme : baseLightTheme}
                            extensions={[
                                theme.palette.mode === 'dark' ? editorDarkTheme : editorLightTheme,
                                ...(language === 'python'
                                    ? [python()]
                                    : language === 'javascript'
                                      ? [javascript()]
                                      : []),
                            ]}
                        />
                        <Button variant="contained" sx={{ mt: 1 }} onClick={submitCode}>
                            Submit
                        </Button>
                    </>
                ) : (
                    <Typography>All {exercise.max_submissions} submissions done.</Typography>
                )}
            </CustomTabPanel>

            <CustomTabPanel value={activeIndex} index={1}>
                {submissions.submissions_with_points.length === 0 ? (
                    <Typography>No submissions</Typography>
                ) : (
                    <TableContainer component={Paper}>
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
                                                    submission.grade === 0
                                                        ? 'error'
                                                        : submission.grade < exercise.max_points
                                                          ? 'warning'
                                                          : 'success'
                                                }
                                                variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>
                                                {new Date(submission.submission_time).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CustomTabPanel>
        </>
    );
};

export default Exercise;
