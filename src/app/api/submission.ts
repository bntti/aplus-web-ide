import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { catcher } from './util';
import { ApiTokenN } from '../StateProvider';

const SubmissionBaseSchema = z.object({
    id: z.number().int().nonnegative(),
    submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
    grade: z.number().int().nonnegative(),
    exercise: z.object({
        id: z.number().int().nonnegative(),
        display_name: z.string(),
        max_points: z.number().int().nonnegative(),
    }),
});

const WaitingSubmissionSchema = z.object({ status: z.literal('waiting') });
const RejectedSubmissionSchema = SubmissionBaseSchema.extend({
    status: z.literal('rejected'),
    feedback_json: z.object({ validation_errors: z.record(z.array(z.string())) }),
});
const FileSubmissionSchema = SubmissionBaseSchema.extend({
    status: z.literal('ready'),
    files: z.array(z.object({ id: z.number().int().nonnegative() })).nonempty(),
    // submission_data: z.null(), Might be needed to recognize type
    feedback: z.string(),
});
const QuestionnaireSubmissionSchema = SubmissionBaseSchema.extend({
    status: z.literal('ready'),
    submission_data: z.array(z.array(z.string()).length(2)),
    feedback: z.string(),
    feedback_json: z.object({
        error_fields: z.record(z.array(z.string())),
        fields_points: z.record(
            z.object({
                points: z.number().int().nonnegative(),
                max_points: z.number().int().nonnegative(),
            }),
        ),
    }),
});

const ApiSubmissionSchema = z.union([
    WaitingSubmissionSchema,
    RejectedSubmissionSchema,
    FileSubmissionSchema,
    QuestionnaireSubmissionSchema,
]);
const SubmissionSchema = z.discriminatedUnion('type', [
    WaitingSubmissionSchema.extend({ type: z.literal('waiting') }),
    RejectedSubmissionSchema.extend({ type: z.literal('rejected') }),
    FileSubmissionSchema.extend({ type: z.literal('file') }),
    QuestionnaireSubmissionSchema.extend({ type: z.literal('questionnaire') }),
]);

export type SubmissionData = z.infer<typeof SubmissionSchema>;

export const getSubmission = async (
    apiToken: ApiTokenN,
    submissionId: string | number,
    navigate: NavigateFunction,
): Promise<SubmissionData> => {
    const submissionResponse = await axios
        .get(`/api/v2/submissions/${submissionId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));
    const submission = ApiSubmissionSchema.parse(submissionResponse.data) as unknown as SubmissionData;

    if (submission.status === 'waiting') submission.type = 'waiting';
    else if (submission.status === 'rejected') submission.type = 'rejected';
    else if ('files' in submission) submission.type = 'file';
    else submission.type = 'questionnaire';

    return submission; // Is not parsed again, should be correct
};

export const getSubmissionFiles = async (
    apiToken: ApiTokenN,
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
            .catch((error) => catcher(navigate, error));
        newCodes.push(codeResponse.data);
    }
    return newCodes;
};
