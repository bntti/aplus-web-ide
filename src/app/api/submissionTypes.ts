import { z } from 'zod';

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

const WaitingSubmissionSchema = SubmissionBaseSchema.extend({ status: z.literal('waiting') });
const RejectedSubmissionSchema = SubmissionBaseSchema.extend({
    status: z.literal('rejected'),
    feedback_json: z.object({ validation_errors: z.record(z.array(z.string())) }),
});
const FileSubmissionSchema = SubmissionBaseSchema.extend({
    status: z.literal('ready'),
    files: z.array(z.object({ id: z.number().int().nonnegative() })).nonempty(),
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

export const ApiSubmissionSchema = z.union([
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
