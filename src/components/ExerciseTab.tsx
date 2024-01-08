import { Alert, Typography } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ApiTokenContext } from '../app/StateProvider';
import { ExerciseData, ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { getSubmission } from '../app/api/submission';
import { SubmissionData } from '../app/api/submissionTypes';
import CodeEditor from '../components/CodeEditor';
import FormExercise from '../components/FormExercise';
import SubmissionSnackbar, { SubmissionStatus } from '../components/SubmissionSnackbar';

type Props = {
    numSubmissions: number;
    exercise: ExerciseData;

    formCallback: () => void;
    latestSubmission: SubmissionData | null;

    codeCallback: () => void;
    templates: string[] | null;
    latestSubmissionFiles: string[] | null;
};

const ExerciseTab = ({
    numSubmissions,
    exercise,

    formCallback: parentFormCallBack,
    latestSubmission,

    codeCallback,
    templates,
    latestSubmissionFiles,
}: Props): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { apiToken } = useContext(ApiTokenContext);

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] } | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('hidden');
    const [loadingSubmissionResponse, setLoadingSubmissionResponse] = useState<boolean>(false);

    const formCallback = (response: AxiosResponse): void => {
        if (apiToken === null) throw new Error('formCallback was called with null apiToken');

        const submissionApiUrl = JSON.stringify(response.headers.location, null, 4); // TODO: Check that works in prod
        const submissionId = parseInt(submissionApiUrl.split('/').pop() as string);

        const loadSubmission = async (): Promise<void> => {
            const newLatestSubmission = await getSubmission(apiToken, submissionId, navigate);
            if (newLatestSubmission.type === 'waiting') {
                setTimeout(loadSubmission, 500); // TODO: long polling etc
                return;
            }

            if (newLatestSubmission.type === 'questionnaire') {
                setSubmissionStatus('success');
                setValidationErrors(null);
            } else if (newLatestSubmission.type === 'rejected') {
                setSubmissionStatus('rejected');
                setValidationErrors(newLatestSubmission.feedback_json.validation_errors);
            }
            parentFormCallBack();
            setLoadingSubmissionResponse(false);
        };
        setLoadingSubmissionResponse(true);
        setSubmissionStatus('loading');
        parentFormCallBack();
        loadSubmission().catch(console.error);
    };

    if (apiToken === null) throw new Error('ExerciseTab was called even though apiToken is null');
    return (
        <>
            {numSubmissions >= exercise.max_submissions && (
                <Alert variant="outlined" severity="info" sx={{ mb: 1 }}>
                    {t('all-submissions-done', { count: exercise.max_submissions })}
                </Alert>
            )}

            {exercise.exercise_info === null ? (
                <Typography>{t('exercise-submission-type-info-unavailable')}</Typography>
            ) : exercise.exercise_info.form_spec[0].type === 'file' ? (
                <CodeEditor
                    exercise={exercise as ExerciseDataWithInfo}
                    callback={codeCallback}
                    codes={
                        latestSubmissionFiles ??
                        templates ??
                        (Array(exercise.exercise_info.form_spec.length).fill('') as string[])
                    }
                    readOnly={numSubmissions >= exercise.max_submissions}
                />
            ) : (
                <>
                    {loadingSubmissionResponse && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                            {t('submission-loading')}
                        </Alert>
                    )}
                    <SubmissionSnackbar status={submissionStatus} setStatus={setSubmissionStatus} />
                    {latestSubmission && latestSubmission.type === 'questionnaire' ? (
                        <FormExercise
                            exercise={exercise as ExerciseDataWithInfo}
                            apiToken={apiToken}
                            callback={formCallback}
                            answers={latestSubmission.submission_data as [string, string][]}
                            feedback={latestSubmission.feedback_json.error_fields}
                            points={latestSubmission.feedback_json.fields_points}
                            validationErrors={validationErrors}
                            readOnly={loadingSubmissionResponse || numSubmissions >= exercise.max_submissions}
                        />
                    ) : (
                        <FormExercise
                            exercise={exercise as ExerciseDataWithInfo}
                            apiToken={apiToken}
                            callback={formCallback}
                            validationErrors={validationErrors}
                            readOnly={loadingSubmissionResponse || numSubmissions >= exercise.max_submissions}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default ExerciseTab;
