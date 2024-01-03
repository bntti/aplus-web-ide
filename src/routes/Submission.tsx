import { Button, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getExercise } from '../app/api/exercise';
import { ExerciseData } from '../app/api/exerciseTypes';
import { SubmissionData, getSubmission, getSubmissionFiles } from '../app/api/submission';
import { parseTitle } from '../app/util';
import PointsChip from '../components/PointsChip';
import SubmissionComponent from '../components/SubmissionComponent';

const Submission = (): JSX.Element => {
    const navigate = useNavigate();
    const { submissionId } = useParams();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);

    const [codes, setCodes] = useState<string[] | null>(null);
    const [exercise, setExercise] = useState<ExerciseData | null>(null);
    const [submission, setSubmission] = useState<SubmissionData | null>(null);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || submissionId === undefined) return;
            const newSubmission = await getSubmission(apiToken, submissionId, navigate);
            setSubmission(newSubmission);
            if (newSubmission.type === 'waiting') {
                setTimeout(getData, 5000);
                return;
            }
            setExercise(await getExercise(apiToken, newSubmission.exercise.id, navigate));

            if (newSubmission.type !== 'file') return;
            setCodes(await getSubmissionFiles(apiToken, submissionId, newSubmission.files, navigate));
        };

        getData().catch(console.error);
    }, [apiToken, submissionId, navigate]);

    useEffect(() => {
        if (window?.MathJax !== undefined) {
            window.MathJax.typeset();
        }
    });

    if (submission === null) return <Typography>{t('loading-submission')}</Typography>;
    if (exercise?.exercise_info === null) return <Typography>{t('no-exercise-info-available')}</Typography>;
    return (
        <>
            <Typography variant="h4">{parseTitle(submission.exercise.display_name, language)}</Typography>
            <Typography>
                {t('submission')} {submission.submission_time.toLocaleString()}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }} alignItems="center">
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                        navigate(`/exercise/${submission.exercise.id}`, { state: { showSubmissions: true } })
                    }
                >
                    {t('go-back')}
                </Button>
                <PointsChip
                    points={submission.grade}
                    maxPoints={submission.exercise.max_points}
                    disabled={submission.type === 'waiting'}
                    gray={submission.type === 'waiting'}
                />
            </Stack>
            <SubmissionComponent submission={submission} exercise={exercise} codes={codes} />
        </>
    );
};

export default Submission;
