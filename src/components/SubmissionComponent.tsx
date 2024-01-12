import { Box, Container, Paper, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CodeEditor from './CodeEditor';
import FormExercise from './FormExercise';
import TabPanel from './TabPanel';
import { ExerciseData, ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { SubmissionData } from '../app/api/submissionTypes';

type Props = { submission: SubmissionData; exercise: ExerciseData | null; codes: string[] | null };

const SubmissionComponent = ({ submission, exercise, codes }: Props): JSX.Element => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState<number>(0);

    if (submission.type !== 'waiting' && submission.type !== 'rejected' && exercise === null) {
        return <Typography>{t('loading-submission')}</Typography>;
    }
    switch (submission.type) {
        case 'waiting':
            return <Typography variant="h5">{t('waiting-for-grading')}</Typography>;
        case 'rejected':
            return (
                <Typography variant="h5" color="error">
                    {t('submission-rejected')}
                </Typography>
            );
        case 'questionnaire':
            return (
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
            );
        case 'file':
            return (
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
                            <Skeleton variant="rounded" height="55vh" />
                        ) : (
                            <CodeEditor exercise={exercise as ExerciseDataWithInfo} codes={codes} readOnly />
                        )}
                    </TabPanel>
                </>
            );
    }
};

export default SubmissionComponent;
