import { Button, Chip, Container, Paper, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';

type SubmissionT = {
    id: number;
    submission_time: string;
    grade: number;
    exercise: { id: number; display_name: string; max_points: number };
    status: string;
    feedback: string;
};

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
                setSubmission(response.data);
            })
            .catch(console.error);
    }, [apiToken, submissionId]);

    if (apiToken === null) return <Navigate replace to="/courses" />;
    if (submission === null) return <Typography>Loading exercise...</Typography>;
    return (
        <>
            <Typography variant="h3">{submission.exercise.display_name}</Typography>
            <Typography variant="h6">Submission {new Date(submission.submission_time).toLocaleString()}</Typography>
            <Chip
                sx={{ mt: 0.5, mb: 3 }}
                label={`${submission.grade} / ${submission.exercise.max_points}`}
                color={
                    submission.grade === 0
                        ? 'error'
                        : submission.grade < submission.exercise.max_points
                          ? 'warning'
                          : 'success'
                }
                variant={currentTheme.palette.mode === 'dark' ? 'filled' : 'outlined'}
            />
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
            <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => navigate(`/exercise/${submission.exercise.id}`, { state: { showSubmissions: true } })}
            >
                Go back
            </Button>
        </>
    );
};

export default Submission;
