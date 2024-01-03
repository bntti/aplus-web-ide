import { Box, Button, Container, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getExercise } from '../app/api/exercise';
import { ExerciseData, ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { SubmissionData, getSubmission, getSubmissionFiles } from '../app/api/submission';
import CodeEditor from '../components/CodeEditor';
import FormExercise from '../components/FormExercise';
import PointsChip from '../components/PointsChip';
import TabPanel from '../components/TabPanel';

const Submission = (): JSX.Element => {
    const navigate = useNavigate();
    const { submissionId } = useParams();
    const { t } = useTranslation();

    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);

    const [codes, setCodes] = useState<string[] | null>(null);
    const [exercise, setExercise] = useState<ExerciseData | null>(null);
    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

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

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        if (language === 'english') return matches ? matches[1] + matches[2] : name;
        else if (language === 'finnish') return matches ? matches[1] + matches[3] : name;
        throw new Error(`Invalid language ${language}`);
    };

    useEffect(() => {
        if (window?.MathJax !== undefined) {
            window.MathJax.typeset();
        }
    });

    if (submission === null) return <Typography>{t('loading-submission')}</Typography>;
    if (exercise?.exercise_info === null) return <Typography>{t('no-exercise-info-available')}</Typography>;

    const Base = (
        <>
            <Typography variant="h4">{parseName(submission.exercise.display_name)}</Typography>
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
        </>
    );

    if (submission.type === 'waiting') {
        return (
            <>
                {Base}
                <Typography variant="h5">{t('waiting-for-grading')}</Typography>
            </>
        );
    }
    if (submission.type === 'rejected')
        return (
            <>
                {Base}
                <Typography variant="h5" color="error">
                    {t('submission-rejected')}
                </Typography>
            </>
        );

    if (exercise === null) return <Typography>{t('loading-submission')}</Typography>;
    return (
        <>
            {Base}
            {submission.type === 'questionnaire' ? (
                <>
                    <Typography variant="h5">{t('feedback:')}</Typography>
                    <FormExercise
                        exercise={exercise as ExerciseDataWithInfo}
                        answers={submission.submission_data as [string, string][]}
                        feedback={submission.feedback_json.error_fields}
                        points={submission.feedback_json.fields_points}
                        readOnly
                    />
                </>
            ) : (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeIndex} onChange={(_, value) => setActiveIndex(value)}>
                            <Tab label={t('feedback')} />
                            <Tab label={t('code')} />
                        </Tabs>
                    </Box>
                    <TabPanel index={0} value={activeIndex}>
                        <Container component={Paper} sx={{ p: 2 }}>
                            <div dangerouslySetInnerHTML={{ __html: submission.feedback }} />
                        </Container>
                    </TabPanel>
                    <TabPanel index={1} value={activeIndex}>
                        {codes === null ? (
                            <Typography>{t('loading-code')}</Typography>
                        ) : (
                            <CodeEditor exercise={exercise as ExerciseDataWithInfo} codes={codes} readOnly />
                        )}
                    </TabPanel>
                </>
            )}
        </>
    );
};

export default Submission;
