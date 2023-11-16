import { Chip, Container, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectApiToken } from '../app/state/apiToken';

type SubmissionT = {
    id: number;
    submission_time: string;
    grade: number;
    exercise: { max_points: number; display_name: string };
    status: string;
    feedback: string;
};

const Submission = (): JSX.Element => {
    const { submissionId } = useParams();

    const apiToken = useSelector(selectApiToken);
    const [submission, setSubmission] = useState<SubmissionT | null>(null);

    useEffect(() => {
        if (apiToken === '') return;
        axios
            .get(`/api/v2/submissions/${submissionId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                setSubmission(response.data);
            })
            .catch(console.error);
    }, [apiToken, submissionId]);

    if (apiToken === '') return <Typography>No api token</Typography>;
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
                variant="outlined"
            />
            <br />
            <br />
            <Typography variant="h5">Feedback:</Typography>
            <Container
                component={Paper}
                sx={{
                    display: 'block',
                    bgcolor: '#fff',
                    color: 'grey.800',
                    border: '1px solid',
                    borderColor: 'grey.500',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                }}
            >
                <pre>{submission.feedback.replace('<pre>', '').replace('</pre>', '')}</pre>
            </Container>
        </>
    );
};

export default Submission;
