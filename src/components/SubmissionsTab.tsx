import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Submissions } from '../app/api/exerciseTypes';
import PointsChip from '../components/PointsChip';

type Props = { numSubmissions: number; numWithPoints: number; maxPoints: number; submissions: Submissions };

const SubmissionsTab = ({ numSubmissions, numWithPoints, maxPoints, submissions }: Props): JSX.Element => {
    const { t } = useTranslation();

    if (numWithPoints === 0) return <Typography>{t('no-submissions')}</Typography>;
    return (
        <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table component="div">
                <TableHead component="div">
                    <TableCell component="div">{t('submission-#')}</TableCell>
                    <TableCell component="div">{t('points')}</TableCell>
                    <TableCell component="div" align="right">
                        {t('submission-time')}
                    </TableCell>
                </TableHead>
                <TableBody component="div">
                    {submissions.results.map((submission, index) => (
                        <TableRow
                            key={submission.id}
                            component={Link}
                            to={`/submission/${submission.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <TableCell component="div">
                                <Typography>{numSubmissions - index}</Typography>
                            </TableCell>
                            <TableCell component="div">
                                <PointsChip points={submission.grade} maxPoints={maxPoints} />
                            </TableCell>
                            <TableCell component="div" align="right">
                                <Typography>{submission.submission_time.toLocaleString()}</Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SubmissionsTab;
