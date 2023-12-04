import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { catcher } from './util';
import { ApiTokenN } from '../StateProvider';

const SubmissionSchema = z.object({
    id: z.number().int().nonnegative(),
    submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
    grade: z.number().int().nonnegative(),
    exercise: z.object({
        id: z.number().int().nonnegative(),
        display_name: z.string(),
        max_points: z.number().int().nonnegative(),
    }),
    files: z.array(z.object({ id: z.number().int().nonnegative() })),
    status: z.string(),
    feedback: z.string(),
});
export type SubmissionData = z.infer<typeof SubmissionSchema>;

export const getSubmission = async (
    apiToken: ApiTokenN,
    submissionId: string | number,
    navigate: NavigateFunction,
): Promise<SubmissionData | never> => {
    const submissionResponse = await axios
        .get(`/api/v2/submissions/${submissionId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));
    return SubmissionSchema.parse(submissionResponse.data);
};

export const getSubmissionFiles = async (
    apiToken: ApiTokenN,
    submissionId: string | number,
    files: { id: number }[],
    navigate: NavigateFunction,
): Promise<string[] | never> => {
    const newCodes = [];
    for (let i = 0; i < files.length; i++) {
        const codeResponse = await axios
            .get(`/api/v2/submissions/${submissionId}/files/${files[i].id}`, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .catch((error) => catcher(navigate, error));
        newCodes.push(codeResponse.data);
    }
    return newCodes;
};
