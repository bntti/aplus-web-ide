import { Button, Chip, Container, Paper, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';

type SubmissionT = {
    id: number;
    submission_time: string;
    grade: number;
    exercise: { max_points: number; display_name: string };
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

    if (apiToken === null) return <Typography>No api token</Typography>;
    if (submission === null) return <Typography>Loading exercise...</Typography>;
    return (
        <>
            <Typography variant="h3">Submission #{submission.id}</Typography>
            <Typography>{submission.submission_time}</Typography>
            <Chip
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
            <Typography variant="h5" sx={{ mt: 2 }}>
                Feedback:
            </Typography>
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
            <Button variant="contained" sx={{ mt: 1 }} onClick={() => navigate(-1)}>
                Go back
            </Button>
        </>
    );
};

export default Submission;
