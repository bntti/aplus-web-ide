import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Done';
import {
    Chip,
    Container,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageContext } from '../app/StateProvider';
import { CourseModuleData } from '../app/api/course';
import { parseTitle } from '../app/util';
import PointsChip from '../components/PointsChip';

type Props = {
    module: CourseModuleData;
    exerciseMaxSubmissions: { [key: number]: number };
};
const CourseModule = ({ module, exerciseMaxSubmissions }: Props): JSX.Element => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { language } = useContext(LanguageContext);

    return (
        <>
            <Container component={Paper} sx={{ mb: 5, pt: 3, pb: 2.5 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                    {parseTitle(module.name, language)}
                </Typography>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    {module.passed ? (
                        <Typography color="success.main">{t('passed')}</Typography>
                    ) : module.points < module.points_to_pass ? (
                        <Typography>
                            {t('points-required-to-pass')} {module.points_to_pass}
                        </Typography>
                    ) : (
                        <Typography>{t('some-exercises-not-passed')}</Typography>
                    )}
                    <Stack direction="row" spacing={1}>
                        <Typography>{t('points')}</Typography>
                        <PointsChip points={module.points} maxPoints={module.max_points} size="small" />
                    </Stack>
                </Stack>
                <TableContainer>
                    <Table component="div" size="small">
                        <TableHead component="div">
                            <TableRow component="div">
                                <TableCell component="div">
                                    <Typography>{t('exercise')}</Typography>
                                </TableCell>
                                <TableCell component="div" align="right">
                                    <Typography>{t('passed')}</Typography>
                                </TableCell>
                                <TableCell component="div" align="right">
                                    <Typography>{t('submissions')}</Typography>
                                </TableCell>
                                <TableCell component="div" align="right">
                                    <Typography>{t('points')}</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody component="div">
                            {module.exercises.map((exercise) => (
                                <TableRow
                                    key={exercise.id}
                                    component={Link}
                                    to={`/exercise/${exercise.id}`}
                                    sx={{
                                        textDecoration: 'none',
                                        '&:last-child div.MuiTableCell-root': {
                                            borderBottom: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="div" sx={{ width: '70%' }}>
                                        <Typography>{parseTitle(exercise.name, language)}</Typography>
                                    </TableCell>
                                    <TableCell component="div" align="right">
                                        {exercise.passed ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                                    </TableCell>
                                    <TableCell component="div" align="right">
                                        <Chip
                                            label={`${exercise.submission_count} / ${
                                                exerciseMaxSubmissions[exercise.id]
                                            }`}
                                            disabled={exercise.submission_count === exerciseMaxSubmissions[exercise.id]}
                                            color="default"
                                            variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell component="div" align="right">
                                        <PointsChip
                                            points={exercise.points}
                                            maxPoints={exercise.max_points}
                                            disabled={exercise.submission_count === exerciseMaxSubmissions[exercise.id]}
                                            gray={exercise.submission_count === 0}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
};

export default CourseModule;
