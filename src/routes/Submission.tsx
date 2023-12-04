import { Box, Button, Chip, Container, Paper, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { ExerciseSchema, ExerciseT, ExerciseWithInfo } from './exerciseTypes';
import { ApiTokenContext, LanguageContext } from '../app/StateProvider';
import CodeEditor from '../components/CodeEditor';
import TabPanel from '../components/TabPanel';

const SubmissionSchema = z.object({
    id: z.number().int().nonnegative(),
    submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
    grade: z.number().int().nonnegative(),
    exercise: z.object({
        id: z.number().int().nonnegative(),
        display_name: z.string(),
        max_points: z.number().int().nonnegative(),
    }),
    files: z.array(z.object({ id: z.number().int().nonnegative() })),
    status: z.string(),
    feedback: z.string(),
});
type SubmissionT = z.infer<typeof SubmissionSchema>;

const Submission = (): JSX.Element => {
    const currentTheme = useTheme();
    const navigate = useNavigate();
    const { submissionId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);
    const { language } = useContext(LanguageContext);

    const [codes, setCodes] = useState<string[] | null>(null);
    const [exercise, setExercise] = useState<ExerciseT | null>(null);
    const [submission, setSubmission] = useState<SubmissionT | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    useEffect(() => {
        const getData = async (): Promise<void> => {
            const submissionResponse = await axios.get(`/api/v2/submissions/${submissionId}`, {
                headers: { Authorization: `Token ${apiToken}` },
            });
            const newSubmission = SubmissionSchema.parse(submissionResponse.data);
            setSubmission(newSubmission);

            if (newSubmission.files.length === 0) return;
            const exerciseResponse = await axios.get(`/api/v2/exercises/${newSubmission.exercise.id}`, {
                headers: { Authorization: `Token ${apiToken}` },
            });
            setExercise(ExerciseSchema.parse(exerciseResponse.data));

            const newCodes = [];
            for (let i = 0; i < newSubmission.files.length; i++) {
                const codeResponse = await axios.get(
                    `/api/v2/submissions/${submissionId}/files/${newSubmission.files[i].id}`,
                    {
                        headers: { Authorization: `Token ${apiToken}` },
                    },
                );
                newCodes.push(codeResponse.data);
            }
            setCodes(newCodes);
        };

        getData().catch(console.error);
    }, [apiToken, submissionId]);

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
                            <CodeEditor exercise={exercise as ExerciseWithInfo} codes={codes} readOnly />
                        )}
                    </TabPanel>
                </>
            )}
        </>
    );
};

export default Submission;
