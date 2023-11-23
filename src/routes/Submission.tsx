import { Button, Chip, Container, Paper, Stack, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ApiTokenContext } from '../app/StateProvider';

const SubmissionSchema = z.object({
    id: z.number().int().nonnegative(),
    submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
    grade: z.number().int().nonnegative(),
    exercise: z.object({
        id: z.number().int().nonnegative(),
        display_name: z.string(),
        max_points: z.number().int().nonnegative(),
    }),
    status: z.string(),
    feedback: z.string(),
});
type SubmissionT = z.infer<typeof SubmissionSchema>;

const Submission = (): JSX.Element => {
    const currentTheme = useTheme();
    const navigate = useNavigate();
    const { submissionId } = useParams();
    const { apiToken } = useContext(ApiTokenContext);

    const [submission, setSubmission] = useState<SubmissionT | null>(null);

    useEffect(() => {
        if (apiToken === null) return;
        axios
            .get(`/api/v2/submissions/${submissionId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setSubmission(SubmissionSchema.parse(response.data));
            })
            .catch(console.error);
    }, [apiToken, submissionId]);

    const parseName = (name: string): string => {
        const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
        const matches = name.match(regexp);
        return matches ? matches[1] + matches[2] : name;
    };

    if (apiToken === null) return <Navigate replace to="/courses" />;
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

            <Typography variant="h6">Feedback:</Typography>
            <Container
                component={Paper}
                sx={{
                    display: 'block',
                    mt: 1,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
                    color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
                    border: '1px solid',
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
                    borderRadius: 2,
                    fontSize: '0.875rem',
                }}
            >
                <pre>{submission.feedback.replace('<pre>', '').replace('</pre>', '').trim()}</pre>
            </Container>
        </>
    );
};

export default Submission;
