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
} from '@mui/material';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';

type ExerciseT = {
    display_name: string;
    is_submittable: boolean;
    max_points: number;
    max_submissions: number;
    exercise_info: { form_spec: { title: string }[] };
};

type Submissions = {
    submissions_with_points: { id: number; submission_time: string; grade: number }[];
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
    const { exerciseId } = useParams();

    const apiToken = useSelector(selectApiToken);
    const [exercise, setExercise] = useState<ExerciseT | null>(null);
    const [submissions, setSubmissions] = useState<Submissions | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [code, setCode] = useState<string>('');
    const [language, setLanguage] = useState<string | null>(null);

    useEffect(() => {
        if (apiToken === '') return;
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
        axios
            .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then((response) => {
                setSubmissions(response.data);
            })
            .catch(console.error);
    }, [apiToken, exerciseId]);

    const submitCode = (): void => {
        const formData = new FormData();
        formData.append('file1', new Blob([code]));
        axios
            .post(`/api/v2/exercises/${exerciseId}/submissions/submit`, formData, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .catch(console.error);
    };

    const editorTheme = EditorView.theme({
        '&.cm-editor.cm-focused': {
            outline: '1px solid #c0c0c0',
        },
    });

    if (apiToken === '') return <Typography>No api token</Typography>;
    if (exercise !== null && !exercise.is_submittable) return <Typography>Exercise is not submittable?</Typography>;
    if (exercise === null || submissions === null) return <Typography>Loading exercise...</Typography>;
    return (
        <>
            <Typography variant="h3">{exercise.display_name}</Typography>
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
                {language !== null && <Typography>Detected language {language}</Typography>}
                <ReactCodeMirror
                    value={code}
                    height="700px"
                    onChange={(val) => {
                        setCode(val);
                    }}
                    theme={editorTheme}
                    extensions={language === 'python' ? [python()] : language === 'javascript' ? [javascript()] : []}
                />
                <br />
                <Button variant="contained" onClick={submitCode}>
                    Submit
                </Button>
            </CustomTabPanel>

            <CustomTabPanel value={activeIndex} index={1}>
                {submissions.submissions_with_points.length === 0 ? (
                    <Typography>No submissions</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table component="div">
                            <TableHead component="div"></TableHead>
                            <TableCell component="div">Submission #</TableCell>
                            <TableCell component="div">Score</TableCell>
                            <TableCell align="right" component="div">
                                Submission time
                            </TableCell>

                            <TableBody component="div">
                                {submissions.submissions_with_points.map((submission) => (
                                    <TableRow
                                        key={submission.id}
                                        component={Link}
                                        to={`/submission/${submission.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <TableCell component="div">
                                            <Typography>{submission.id}</Typography>
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
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell component="div" align="right">
                                            <Typography>{submission.submission_time}</Typography>
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
