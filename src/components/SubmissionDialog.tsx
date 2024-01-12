import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PointsChip from './PointsChip';
import SubmissionComponent from './SubmissionComponent';
import { ApiTokenContext } from '../app/StateProvider';
import { ExerciseData } from '../app/api/exerciseTypes';
import { getSubmission, getSubmissionFiles } from '../app/api/submission';
import { SubmissionData } from '../app/api/submissionTypes';

type Props = { exercise: ExerciseData; targetSubmission: { id: number; num: number } | null; onClose: () => void };

const SubmissionDialog = ({ exercise, targetSubmission, onClose }: Props): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);

    const [codes, setCodes] = useState<string[] | null>(null);
    const [submission, setSubmission] = useState<SubmissionData | null>(null);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || targetSubmission === null) return;
            const newSubmission = await getSubmission(apiToken, targetSubmission.id, navigate);
            let newCodes = null;

            if (newSubmission.type === 'waiting') {
                setSubmission(newSubmission);
                setTimeout(getData, 5000);
                return;
            }

            newCodes = null;
            if (newSubmission.type === 'file') {
                newCodes = await getSubmissionFiles(apiToken, targetSubmission.id, newSubmission.files, navigate);
            }

            setSubmission(newSubmission);
            if (newCodes) setCodes(newCodes);
        };

        getData().catch(console.error);
    }, [apiToken, targetSubmission, navigate]);

    useEffect(() => {
        if (window?.MathJax !== undefined) window.MathJax.typeset();
    });

    if (submission === null || exercise?.exercise_info === null) {
        return (
            <Dialog open={targetSubmission !== null} onClose={onClose}>
                {submission === null ? t('loading-submission') : t('no-exercise-info-available')}
            </Dialog>
        );
    }
    return (
        <Dialog open={targetSubmission !== null} onClose={onClose} fullWidth maxWidth="lg" sx={{ p: 0 }}>
            <DialogContent sx={{ px: 1, py: 2 }} dividers>
                <DialogTitle sx={{ pb: 0.5, pt: 0 }}>
                    {t('submission')} #{targetSubmission?.num}
                </DialogTitle>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 3 }}>
                    <Typography color="text.secondary">
                        {t('submission')} {submission.submission_time.toLocaleString()}
                    </Typography>
                    <PointsChip
                        points={submission.grade}
                        maxPoints={submission.exercise.max_points}
                        disabled={submission.type === 'waiting'}
                        gray={submission.type === 'waiting'}
                        size="small"
                    />
                </Stack>
                <Divider sx={{ mt: 1, mb: 2 }} />

                <SubmissionComponent submission={submission} exercise={exercise} codes={codes} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmissionDialog;
