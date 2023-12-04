import { Box, Button, Chip, Container, Paper, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import { getExercise } from '../app/api/exercise';
import { ExerciseData, ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { SubmissionData, getSubmission, getSubmissionFiles } from '../app/api/submission';
import CodeEditor from '../components/CodeEditor';
import TabPanel from '../components/TabPanel';

const Submission = (): JSX.Element => {
    const { submissionId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);
    const currentTheme = useTheme();
    const navigate = useNavigate();

    const [codes, setCodes] = useState<string[] | null>(null);
    const [exercise, setExercise] = useState<ExerciseData | null>(null);
    const [submission, setSubmission] = useState<SubmissionData | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            if (apiToken === null || submissionId === undefined) return;
            const newSubmission = await getSubmission(apiToken, submissionId, navigate);
            setSubmission(newSubmission);

            if (newSubmission.files.length === 0) return; // Return if is not submission exercise
            setExercise(await getExercise(apiToken, newSubmission.exercise.id, navigate));
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

    if (submission === null) return <Typography>Loading exercise...</Typography>;
    return (
        <>
            <Typography variant="h4">{parseName(submission.exercise.display_name)}</Typography>
            <Typography>Submission {submission.submission_time.toLocaleString()}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }} alignItems="center">
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                        navigate(`/exercise/${submission.exercise.id}`, { state: { showSubmissions: true } })
                    }
                >
                    Go back
                </Button>
                <Chip
                    label={`${submission.grade} / ${submission.exercise.max_points}`}
                    color={
                        submission.grade === 0 && submission.exercise.max_points > 0
                            ? 'error'
                            : submission.grade < submission.exercise.max_points
                              ? 'warning'
                              : 'success'
                    }
                    variant={currentTheme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                />
            </Stack>
            {submission.files.length === 0 ? (
                <>
                    <Typography variant="h5">Feedback:</Typography>
                    <Container component={Paper} sx={{ p: 2 }}>
                        <div dangerouslySetInnerHTML={{ __html: submission.feedback }} />
                    </Container>
                </>
            ) : (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeIndex} onChange={(_, value) => setActiveIndex(value)}>
                            <Tab label="Feedback" />
                            <Tab label="Code" />
                        </Tabs>
                    </Box>
                    <TabPanel index={0} value={activeIndex}>
                        <Container component={Paper} sx={{ p: 2 }}>
                            <div dangerouslySetInnerHTML={{ __html: submission.feedback }} />
                        </Container>
                    </TabPanel>
                    <TabPanel index={1} value={activeIndex}>
                        {codes === null ? (
                            <Typography>Loading code...</Typography>
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
