import { z } from 'zod';

const RadioSchema = z.object({
    type: z.literal('radio'),
    key: z.string(),
    title: z.string(),
    required: z.boolean(),
    description: z.string(),
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
    description: z.string(),
});
const FileSchema = z.object({ type: z.literal('file'), key: z.string() });
const StaticSchema = z.object({ type: z.literal('static'), description: z.string() });
const GeneralSchema = z.union([RadioSchema, DropdownSchema, CheckboxSchema, TextSchema, FileSchema, StaticSchema]);

export const ExerciseSchema = z.object({
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
});
const ExerciseWithInfoSchema = ExerciseSchema.extend({
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

export type ExerciseT = z.infer<typeof ExerciseSchema>;
export type ExerciseWithInfo = z.infer<typeof ExerciseWithInfoSchema>;
