import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';

import { ApiSubmissionSchema, SubmissionData } from './submissionTypes';
import { ApiToken } from '../StateProvider';
import { apiCatcher } from '../util';

export const getSubmission = async (
    apiToken: ApiToken,
    submissionId: string | number,
    navigate: NavigateFunction,
): Promise<SubmissionData> => {
    const submissionResponse = await axios
        .get(`/api/v2/submissions/${submissionId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));
    const submission = ApiSubmissionSchema.parse(submissionResponse.data) as unknown as SubmissionData;

    if (submission.status === 'waiting') submission.type = 'waiting';
    else if (submission.status === 'rejected') submission.type = 'rejected';
    else if ('files' in submission) submission.type = 'file';
    else submission.type = 'questionnaire';

    return submission; // Is not parsed again, should be correct
};

export const getSubmissionFiles = async (
    apiToken: ApiToken,
    submissionId: string | number,
    files: { id: number }[],
    navigate: NavigateFunction,
): Promise<string[]> => {
    const newCodes = [];
    for (let i = 0; i < files.length; i++) {
        const codeResponse = await axios
            .get(`/api/v2/submissions/${submissionId}/files/${files[i].id}`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .catch((error) => apiCatcher(navigate, error));
        newCodes.push(codeResponse.data);
    }
    return newCodes;
};
