import {
    Alert,
    Box,
    Button,
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
} from '@mui/material';
import { AxiosResponse } from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, GraderTokenContext, LanguageContext, UserContext } from '../app/StateProvider';
import {
    Submissions,
    SubmitterStats,
    getExercise,
    getSubmissions,
    getSubmitterStats,
    getTemplates,
} from '../app/api/exercise';
import { ExerciseData, ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { getGraderToken } from '../app/api/login';
import { SubmissionData, getSubmission, getSubmissionFiles } from '../app/api/submission';
import CodeEditor from '../components/CodeEditor';
import FormExercise from '../components/FormExercise';
import PointsChip from '../components/PointsChip';
import SubmissionSnackbar, { SubmissionStatus } from '../components/SubmissionSnackbar';
import TabPanel from '../components/TabPanel';

const Exercise = (): JSX.Element => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { exerciseId } = useParams();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { graderToken, setGraderToken } = useContext(GraderTokenContext);
    const { language } = useContext(LanguageContext);
    const { user } = useContext(UserContext);

    const [exercise, setExercise] = useState<ExerciseData | null>(null);
    const [templates, setTemplates] = useState<string[] | null>(null);
    const [submitterStats, setSubmitterStats] = useState<SubmitterStats | null>(null);
    const [submissions, setSubmissions] = useState<Submissions | null>(null);
    const [latestSubmission, setLatestSubmission] = useState<SubmissionData | null>(null);
    const [latestSubmissionFiles, setLatestSubmissionFiles] = useState<string[] | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] } | null>(null);

    const [graderRetry, setGraderRetry] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('hidden');

    const getSubmissionsData = useCallback(async (): Promise<void> => {
        if (apiToken === null || exerciseId === undefined) return;
        setSubmissions(await getSubmissions(apiToken, exerciseId, navigate));

        const newSubmitterStats = await getSubmitterStats(apiToken, exerciseId, navigate);
        setSubmitterStats(newSubmitterStats);

        if (newSubmitterStats.submissions_with_points.length === 0) return;

        const submissionId = newSubmitterStats.submissions_with_points[0].id;
        const newLatestSubmission = await getSubmission(apiToken, submissionId, navigate);
        setLatestSubmission(newLatestSubmission);

        if (newLatestSubmission.type !== 'file') return;
        setLatestSubmissionFiles(await getSubmissionFiles(apiToken, submissionId, newLatestSubmission.files, navigate));
    }, [apiToken, exerciseId, navigate]);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || exerciseId === undefined || user === null) return;
            setLoading(true);
            const newExercise = await getExercise(apiToken, exerciseId, navigate);
            setExercise(newExercise);

            await getSubmissionsData();

            if (newExercise.templates && newExercise.exercise_info) {
                const templateNames = newExercise.templates.split(' ');
                const newTemplates = await getTemplates(graderToken, templateNames).catch(async (error) => {
                    if (error.response.data !== 'Expired token') {
                        throw new Error(`Unknown error with grader ${error.response.data}`);
                    }

                    if (graderRetry) {
                        // Should never happen
                        navigate('/logout', { state: { force: true } });
                        throw new Error('Failed to fetch templates with updated grader token, redirecting to logout');
                    }

                    const newGraderToken = await getGraderToken(apiToken, user.enrolled_courses); // TODO: handle possible infinite loop
                    setGraderToken(newGraderToken);
                    setGraderRetry(true);
                    localStorage.setItem('graderToken', newGraderToken);
                    throw new Error('Failed to fetch templates: grader token expired, trying again with a new one');
                });
                setGraderRetry(false);

                if (newTemplates.length !== newExercise.exercise_info.form_spec.length) {
                    throw new Error('There are missing templates'); // Assuming only file portions in form_spec
                }
                setTemplates(newTemplates); // Assumes correct order of templates
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        getData().catch(console.error);
    }, [apiToken, graderToken, exerciseId, navigate, getSubmissionsData, user, setGraderToken, graderRetry]);

    useEffect(() => {
        if (state && state.showSubmissions && activeIndex !== 1) {
            setActiveIndex(1);
            state.showSubmissions = false;
        }
    }, [state, activeIndex]);

    const codeCallback = (): void => {
        getSubmissionsData().catch(console.error);
        setActiveIndex(1);
    };
    const formCallback = (response: AxiosResponse): void => {
        if (apiToken === null) throw new Error('formCallback was called with null apiToken');
        const submissionApiUrl = JSON.stringify(response.headers.location, null, 4); // TODO: Check that works in prod
        const submissionId = parseInt(submissionApiUrl.split('/').pop() as string);
        const loadSubmission = async (): Promise<void> => {
            const newLatestSubmission = await getSubmission(apiToken, submissionId, navigate);
            if (newLatestSubmission.type === 'waiting') {
                setTimeout(loadSubmission, 500); // TODO: better delay & show loading text / animation
                return;
            } else if (newLatestSubmission.type === 'questionnaire') {
                setSubmissionStatus('success');
                setLatestSubmission(newLatestSubmission);
                setValidationErrors(null);
            } else if (newLatestSubmission.type === 'rejected') {
                setSubmissionStatus('rejected');
                setValidationErrors(newLatestSubmission.feedback_json.validation_errors);
            }
        };
        setSubmissionStatus('loading');
        getSubmissionsData().catch(console.error);
        loadSubmission().catch(console.error);
    };

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        if (language === 'english') return matches ? matches[1] + matches[2] : name;
        else if (language === 'finnish') return matches ? matches[1] + matches[3] : name;
        throw new Error(`Invalid language ${language}`);
    };

    const numSubmissions = submitterStats ? submitterStats.submission_count : 0;

    if (apiToken === null) throw new Error('Exercise was called even though apiToken is null');
    if (exerciseId === undefined) return <Navigate replace to="/courses" />;
    if (exercise !== null && !exercise.is_submittable) throw new Error('Exercise is not submittable?');
    if (exercise === null || submitterStats === null || submissions === null || loading) {
        return <Typography>{t('loading-exercise')}</Typography>;
    }

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
                        {t('submissions-done')} {numSubmissions}/{exercise.max_submissions}
                    </Typography>
                ) : (
                    <Typography>
                        {t('max-submissions')} {exercise.max_submissions}
                    </Typography>
                )}
                {submitterStats.passed ? (
                    <Typography color="success.main">{t('passed')}</Typography>
                ) : (
                    <Typography>
                        {t('points-required-to-pass')} {submitterStats.points_to_pass}
                    </Typography>
                )}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Button variant="outlined" size="small" component={Link} to={`/course/${exercise.course.id}`}>
                    {t('back-to-course')}
                </Button>
                <PointsChip
                    points={submitterStats.points}
                    maxPoints={exercise.max_points}
                    gray={numSubmissions === 0}
                    sx={{ mt: 0.5 }}
                />
            </Stack>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeIndex} onChange={(_, value) => setActiveIndex(value)}>
                    <Tab label={t('exercise')} />
                    {templates !== null && <Tab value={2} label={t('show-templates')} />}
                    <Tab value={1} label={t('submissions')} />
                </Tabs>
            </Box>

            <TabPanel value={activeIndex} index={0}>
                {numSubmissions >= exercise.max_submissions && (
                    <Alert variant="outlined" severity="info" sx={{ mb: 1 }}>
                        {t('all-submissions-done', { count: exercise.max_submissions })}
                    </Alert>
                )}

                {exercise.exercise_info === null ? (
                    <Typography>{t('exercise-submission-type-info-unavailable')}</Typography>
                ) : exercise.exercise_info.form_spec[0].type === 'file' ? (
                    <CodeEditor
                        exercise={exercise as ExerciseDataWithInfo}
                        callback={codeCallback}
                        codes={
                            latestSubmissionFiles ??
                            templates ??
                            (Array(exercise.exercise_info.form_spec.length).fill('') as string[])
                        }
                        readOnly={numSubmissions >= exercise.max_submissions}
                    />
                ) : (
                    <>
                        <SubmissionSnackbar status={submissionStatus} setStatus={setSubmissionStatus} />
                        {latestSubmission && latestSubmission.type === 'questionnaire' ? (
                            <FormExercise
                                exercise={exercise as ExerciseDataWithInfo}
                                apiToken={apiToken}
                                callback={formCallback}
                                answers={latestSubmission.submission_data as [string, string][]}
                                feedback={latestSubmission.feedback_json.error_fields}
                                points={latestSubmission.feedback_json.fields_points}
                                validationErrors={validationErrors}
                                readOnly={numSubmissions >= exercise.max_submissions}
                            />
                        ) : (
                            <FormExercise
                                exercise={exercise as ExerciseDataWithInfo}
                                apiToken={apiToken}
                                callback={formCallback}
                                validationErrors={validationErrors}
                                readOnly={numSubmissions >= exercise.max_submissions}
                            />
                        )}
                    </>
                )}
            </TabPanel>

            {templates !== null && (
                <TabPanel value={activeIndex} index={2}>
                    <CodeEditor exercise={exercise as ExerciseDataWithInfo} codes={templates} readOnly />
                </TabPanel>
            )}

            <TabPanel value={activeIndex} index={1}>
                {submitterStats.submissions_with_points.length === 0 ? (
                    <Typography>{t('no-submissions')}</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                        <Table component="div">
                            <TableHead component="div">
                                <TableCell component="div">{t('submission-#')}</TableCell>
                                <TableCell component="div">{t('points')}</TableCell>
                                <TableCell component="div" align="right">
                                    {t('submission-time')}
                                </TableCell>
                            </TableHead>
                            <TableBody component="div">
                                {submissions.results.map((submission, index) => (
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
                                            <PointsChip points={submission.grade} maxPoints={exercise.max_points} />
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
