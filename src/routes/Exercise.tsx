import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectApiToken } from '../app/state/apiToken';
import { Link, useParams } from 'react-router-dom';
import {
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

type ExerciseT = {
    display_name: string;
    is_submittable: boolean;
    max_points: number;
    max_submissions: number;
};

type Submissions = {
    submissions_with_points: { id: number; submission_time: string; grade: number }[];
};

const Exercise = (): JSX.Element => {
    const { exerciseId } = useParams();

    const apiToken = useSelector(selectApiToken);
    const [exercise, setExercise] = useState<ExerciseT | null>(null);
    const [submissions, setSubmissions] = useState<Submissions | null>(null);

    useEffect(() => {
        if (apiToken === '') return;
        axios
            .get(`/api/v2/exercises/${exerciseId}`, { headers: { Authorization: `Token ${apiToken}` } })
            .then((response) => {
                const newExercise = response.data;
                setExercise(newExercise);
            })
            .catch(console.error);
        axios
            .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then((response) => {
                const newSubmissions = response.data;
                setSubmissions(newSubmissions);
            })
            .catch(console.error);
    }, [apiToken, exerciseId]);

    if (apiToken === '') return <Typography>No api token</Typography>;
    if (exercise !== null && !exercise.is_submittable) return <Typography>Exercise is not submittable?</Typography>;
    return (
        <>
            {exercise === null || submissions === null ? (
                <Typography>Loading exercise...</Typography>
            ) : (
                <>
                    <Typography variant="h3">{exercise.display_name}</Typography>
                    {submissions.submissions_with_points.length === 0 ? (
                        <Typography>No submissions</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table component="div">
                                <TableHead component="div"></TableHead>
                                <TableCell>Submission #</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell align="right">Submission time</TableCell>

                                <TableBody component="div">
                                    {submissions.submissions_with_points.map((submission) => (
                                        <TableRow
                                            key={submission.id}
                                            component={Link}
                                            to={`/submission/${submission.id}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <TableCell component="div">
                                                <Typography>{submission.id}</Typography>
                                            </TableCell>
                                            <TableCell component="div">
                                                <Chip
                                                    label={`${submission.grade} / ${exercise.max_points}`}
                                                    color={
                                                        submission.grade === 0
                                                            ? 'error'
                                                            : submission.grade < exercise.max_points
                                                              ? 'warning'
                                                              : 'success'
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell component="div" align="right">
                                                <Typography>{submission.submission_time}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}
        </>
    );
};

export default Exercise;
