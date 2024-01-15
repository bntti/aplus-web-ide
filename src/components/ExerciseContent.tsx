import { Alert } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CodeEditor, { CodeEditorProps } from './CodeEditor';
import FormExercise, { FormExerciseProps } from './FormExercise';
import SubmissionSnackbar, { SubmissionStatus } from './SubmissionSnackbar';
import { ApiTokenContext } from '../app/StateProvider';
import { ExerciseDataWithInfo } from '../app/api/exerciseTypes';
import { getSubmission } from '../app/api/submission';
import { SubmissionData } from '../app/api/submissionTypes';

type Props = {
    numSubmissions: number;
    exercise: ExerciseDataWithInfo;
    callback: () => void;
    latestSubmission: SubmissionData | null;
    templates: string[] | null;
    latestSubmissionFiles: string[] | null;
    showTemplates: boolean;
};

const ExerciseContent = ({
    numSubmissions,
    exercise,
    callback: parentCallback,
    latestSubmission,
    templates,
    latestSubmissionFiles,
    showTemplates = false,
}: Props): JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { apiToken } = useContext(ApiTokenContext);

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] } | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('hidden');
    const [loadingSubmissionResponse, setLoadingSubmissionResponse] = useState<boolean>(false);

    const callback = (response: AxiosResponse): void => {
        if (apiToken === null) throw new Error('Exercise callback was called with null apiToken');

        const submissionApiUrl = JSON.stringify(response.headers.location, null, 4); // TODO: Check that works in prod
        const submissionId = parseInt(submissionApiUrl.split('/').pop() as string);

        const loadSubmission = async (): Promise<void> => {
            const newLatestSubmission = await getSubmission(apiToken, submissionId, navigate);
            if (newLatestSubmission.type === 'waiting') {
                setTimeout(loadSubmission, 500); // TODO: long polling etc
                return;
            }

            if (newLatestSubmission.type === 'rejected') {
                setSubmissionStatus('rejected');
                setValidationErrors(newLatestSubmission.feedback_json.validation_errors);
            } else {
                setSubmissionStatus('success');
                setValidationErrors(null);
            }
            parentCallback();
            setLoadingSubmissionResponse(false);
        };
        setLoadingSubmissionResponse(true);
        setSubmissionStatus('loading');
        parentCallback();
        loadSubmission().catch(console.error);
    };

    let codeParams: CodeEditorProps;
    if (showTemplates)
        codeParams = {
            exercise,
            codes: templates as string[],
            readOnly: true,
            firstSubmission: !latestSubmission,
        };
    else
        codeParams = {
            exercise,
            callback,
            codes:
                latestSubmissionFiles ??
                templates ??
                (Array(exercise.exercise_info.form_spec.length).fill('') as string[]),
            readOnly: numSubmissions >= exercise.max_submissions,
            firstSubmission: !latestSubmission,
        };

    let formParams: object = {
        exercise,
        apiToken,
        callback,
        validationErrors: validationErrors,
        readOnly: loadingSubmissionResponse || numSubmissions >= exercise.max_submissions,
        firstSubmission: !latestSubmission,
    };
    if (latestSubmission && latestSubmission.type === 'questionnaire')
        formParams = {
            ...formParams,
            answers: latestSubmission.submission_data as [string, string][],
            feedback: latestSubmission.feedback_json.error_fields,
            points: latestSubmission.feedback_json.fields_points,
        };

    if (apiToken === null) throw new Error('ExerciseTab was called even though apiToken is null');
    return (
        <>
            {numSubmissions >= exercise.max_submissions && (
                <Alert variant="outlined" severity="info" sx={{ mb: 1 }}>
                    {t('all-submissions-done', { count: exercise.max_submissions })}
                </Alert>
            )}

            {loadingSubmissionResponse && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    {t('submission-loading')}
                </Alert>
            )}
            <SubmissionSnackbar status={submissionStatus} setStatus={setSubmissionStatus} />
            {exercise.exercise_info.form_spec[0].type === 'file' ? (
                <CodeEditor {...codeParams} />
            ) : (
                <FormExercise {...(formParams as FormExerciseProps)} />
            )}
        </>
    );
};

export default ExerciseContent;
