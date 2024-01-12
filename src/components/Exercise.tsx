import { Button, Divider, ListItemText, Menu, MenuItem, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import ExerciseContent from './ExerciseContent';
import SubmissionDialog from './SubmissionDialog';
import { ApiTokenContext, GraderTokenContext, LanguageContext, UserContext } from '../app/StateProvider';
import { getExercise, getSubmissions, getSubmitterStats, getTemplates } from '../app/api/exercise';
import { ExerciseData, ExerciseDataWithInfo, Submissions, SubmitterStats } from '../app/api/exerciseTypes';
import { getSubmission, getSubmissionFiles } from '../app/api/submission';
import { SubmissionData } from '../app/api/submissionTypes';
import { parseTitle } from '../app/util';
import PointsChip from '../components/PointsChip';

const Exercise = ({ exerciseId }: { exerciseId: number }): JSX.Element => {
    const navigate = useNavigate();
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
    const [loading, setLoading] = useState<boolean>(true);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showTemplates, setShowTemplates] = useState<boolean>(false);
    const [targetSubmission, setTargetSubmission] = useState<{ id: number; num: number } | null>(null);

    const getSubmissionsData = useCallback(async (): Promise<void> => {
        if (apiToken === null || exerciseId === undefined) return;
        const newSubmissions = await getSubmissions(apiToken, exerciseId, navigate);
        const newSubmitterStats = await getSubmitterStats(apiToken, exerciseId, navigate);
        let newLatestSubmission = null;
        let newLatestSubmissionFiles = null;

        if (newSubmitterStats.submissions_with_points.length > 0) {
            const submissionId = newSubmitterStats.submissions_with_points[0].id;
            newLatestSubmission = await getSubmission(apiToken, submissionId, navigate);

            if (newLatestSubmission.type === 'file') {
                newLatestSubmissionFiles = await getSubmissionFiles(
                    apiToken,
                    submissionId,
                    newLatestSubmission.files,
                    navigate,
                );
            }
        }

        setSubmissions(newSubmissions);
        setSubmitterStats(newSubmitterStats);
        if (newLatestSubmission) setLatestSubmission(newLatestSubmission);
        if (newLatestSubmissionFiles) setLatestSubmissionFiles(newLatestSubmissionFiles);
    }, [apiToken, exerciseId, navigate]);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || exerciseId === undefined || user === null || graderToken === null) return;
            setLoading(true);

            const newExercise = await getExercise(apiToken, exerciseId, navigate);
            setExercise(newExercise);
            await getSubmissionsData();

            if (newExercise.templates && newExercise.exercise_info) {
                const templateNames = newExercise.templates.split(' ');
                const newTemplates = await getTemplates(
                    graderToken,
                    apiToken,
                    user,
                    templateNames,
                    navigate,
                    setGraderToken,
                );

                if (newTemplates.length !== newExercise.exercise_info.form_spec.length) {
                    throw new Error('There are missing templates'); // Assuming only file portions in form_spec
                }
                setTemplates(newTemplates); // Assumes correct order of templates
            }
            setLoading(false);
        };
        getData().catch(console.error);
    }, [apiToken, graderToken, exerciseId, navigate, getSubmissionsData, user, setGraderToken]);

    const numSubmissions = submitterStats ? submitterStats.submission_count : 0;

    if (apiToken === null) throw new Error('Exercise was called even though apiToken is null');
    if (exerciseId === undefined) return <Navigate replace to="/" />;
    if (exercise !== null && !exercise.is_submittable) throw new Error('Exercise is not submittable?');
    if (exercise !== null && !exercise.exercise_info) throw new Error('No exercise info?');
    if (exercise === null || submitterStats === null || submissions === null || loading) {
        return <Skeleton variant="rounded" height="60vh" />;
    }

    return (
        <Paper sx={{ p: 1, my: 2 }}>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                divider={<Divider orientation="vertical" flexItem />}
            >
                <>
                    <Button onClick={(event) => setAnchorEl(event.currentTarget)}>
                        {t('submissions-done')} {numSubmissions}/{exercise.max_submissions}
                    </Button>
                    <Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={() => setAnchorEl(null)}>
                        {submissions.results.length === 0 && <MenuItem>{t('no-submissions-yet')}</MenuItem>}
                        {submissions.results.map((submission, index) => (
                            <MenuItem
                                key={submission.id}
                                onClick={() => {
                                    setAnchorEl(null);
                                    setTargetSubmission({ id: submission.id, num: numSubmissions - index });
                                }}
                            >
                                <ListItemText sx={{ mr: 1 }}>#{numSubmissions - index}</ListItemText>
                                <Typography sx={{ mr: 1 }} variant="body2" color="text.secondary">
                                    {submission.submission_time.toLocaleString()}
                                </Typography>
                                <PointsChip points={submission.grade} maxPoints={exercise.max_points} size="small" />
                            </MenuItem>
                        ))}
                    </Menu>
                    <SubmissionDialog
                        exercise={exercise as ExerciseDataWithInfo}
                        targetSubmission={targetSubmission}
                        onClose={() => setTargetSubmission(null)}
                    />
                </>

                {templates !== null && (
                    <Button onClick={() => setShowTemplates(!showTemplates)}>
                        {showTemplates ? t('show-code') : t('show-templates')}
                    </Button>
                )}

                {submitterStats.passed ? (
                    <Typography color="success.main">{t('passed')}</Typography>
                ) : (
                    <Typography>
                        {t('points-required-to-pass')} {submitterStats.points_to_pass}
                    </Typography>
                )}
                <div>
                    <Typography sx={{ display: 'inline', mr: 1 }}>{t('points')}</Typography>
                    <PointsChip
                        points={submitterStats.points}
                        maxPoints={exercise.max_points}
                        gray={numSubmissions === 0}
                        size="small"
                    />
                </div>
            </Stack>
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Typography variant="h5" sx={{ ml: 0.5 }}>
                {parseTitle(exercise.display_name, language)}
            </Typography>

            <ExerciseContent
                numSubmissions={numSubmissions}
                exercise={exercise}
                callback={async (): Promise<void> => await getSubmissionsData()}
                latestSubmission={latestSubmission}
                templates={templates}
                latestSubmissionFiles={latestSubmissionFiles}
                showTemplates={showTemplates}
            />
        </Paper>
    );
};

export default Exercise;
