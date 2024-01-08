import { z } from 'zod';

const RadioSchema = z.object({
    type: z.literal('radio'),
    key: z.string(),
    title: z.string(),
    required: z.boolean(),
    description: z.string().optional(),
    titleMap: z.record(z.string(), z.string()),
    enum: z.array(z.string()),
});
const DropdownSchema = RadioSchema.extend({ type: z.literal('dropdown') });
const CheckboxSchema = RadioSchema.extend({ type: z.literal('checkbox') });
const TextSchema = z.object({
    type: z.union([z.literal('text'), z.literal('number'), z.literal('textarea')]),
    key: z.string(),
    title: z.string(),
    required: z.boolean(),
    description: z.string().optional(),
});
const FileSchema = z.object({ type: z.literal('file'), key: z.string(), title: z.string() });
const StaticSchema = z.object({ type: z.literal('static'), key: z.string(), description: z.string().optional() });
const GeneralSchema = z.union([RadioSchema, DropdownSchema, CheckboxSchema, TextSchema, FileSchema, StaticSchema]);

export const ExerciseDataSchema = z.object({
    id: z.number().int().nonnegative(),
    display_name: z.string(),
    is_submittable: z.boolean(), // What even is this value?
    max_points: z.number().int().nonnegative(),
    max_submissions: z.number().int().nonnegative(),
    course: z.object({ id: z.number().int().nonnegative() }),
    exercise_info: z
        .object({
            form_spec: z.array(GeneralSchema),
            form_i18n: z.record(z.string(), z.object({ en: z.string().optional(), fi: z.string() }).partial()),
        })
        .nullable(),
    templates: z.union([z.literal(''), z.string().url()]),
});
const ExerciseDataWithInfoSchema = ExerciseDataSchema.extend({
    exercise_info: z.object({
        form_spec: z.array(GeneralSchema),
        form_i18n: z.record(z.string(), z.object({ en: z.string(), fi: z.string() })),
    }),
});

export type RadioSpec = z.infer<typeof RadioSchema>;
export type DropdownSpec = z.infer<typeof DropdownSchema>;
export type CheckboxSpec = z.infer<typeof CheckboxSchema>;
export type TextSpec = z.infer<typeof TextSchema>;
export type FormSpec = RadioSpec | DropdownSpec | CheckboxSpec | TextSpec;

export type FileSpec = z.infer<typeof FileSchema>;
export type StaticSpec = z.infer<typeof StaticSchema>;
export type GeneralSpec = z.infer<typeof GeneralSchema>;

export type ExerciseData = z.infer<typeof ExerciseDataSchema>;
export type ExerciseDataWithInfo = z.infer<typeof ExerciseDataWithInfoSchema>;

export const SubmitterStatsSchema = z.object({
    submissions_with_points: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            submission_time: z.string().datetime({ precision: 6 }).pipe(z.coerce.date()),
            grade: z.number().int().nonnegative(),
        }),
    ),
    submission_count: z.number().int().nonnegative(),
    points_to_pass: z.number().int().nonnegative(),
    points: z.number().int().nonnegative(),
    passed: z.boolean(),
});
export type SubmitterStats = z.infer<typeof SubmitterStatsSchema>;

export const SubmissionsSchema = z.object({
    results: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            grade: z.number().int().nonnegative(),
            submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
        }),
    ),
});
export type Submissions = z.infer<typeof SubmissionsSchema>;
