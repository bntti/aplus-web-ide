import { z } from 'zod';

export const CourseDataSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
});
export type CourseData = z.infer<typeof CourseDataSchema>;

// TODO: Has fields next and previous, might be necessary on bigger courses?
export const ExercisesSchema = z.object({
    results: z.array(
        z.object({
            exercises: z.array(
                z.object({ id: z.number().int().nonnegative(), max_submissions: z.number().int().nonnegative() }),
            ),
        }),
    ),
});
export type Exercises = z.infer<typeof ExercisesSchema>;

const CourseModuleSchema = z.object({
    name: z.string(),
    max_points: z.number().int().nonnegative(),
    points_to_pass: z.number().int().nonnegative(),
    submission_count: z.number().int().nonnegative(),
    points: z.number().int().nonnegative(),
    passed: z.boolean(),
    exercises: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            name: z.string(),
            max_points: z.number().int().nonnegative(),
            points_to_pass: z.number().int().nonnegative(),
            submission_count: z.number().int().nonnegative(),
            points: z.number().int().nonnegative(),
            passed: z.boolean(),
        }),
    ),
});
export const CoursePointsSchema = z.object({
    points: z.number().int().nonnegative(),
    modules: z.array(CourseModuleSchema),
});
export type CourseModuleData = z.infer<typeof CourseModuleSchema>;
export type CoursePointsData = z.infer<typeof CoursePointsSchema>;

const BaseSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
});
const CourseTreeExerciseSchema = BaseSchema.extend({ type: z.literal('exercise') }); // TODO: Also has field children
const CourseTreeChapterSchema = BaseSchema.extend({
    type: z.literal('chapter'),
    children: z.array(CourseTreeExerciseSchema),
});
const CourseTreeRootItemSchema = BaseSchema.extend({ children: z.array(CourseTreeChapterSchema) });
export const CourseTreeSchema = z.object({ modules: z.array(CourseTreeRootItemSchema) });
export type CourseTreeChapter = z.infer<typeof CourseTreeChapterSchema>;
export type CourseTreeRootItem = z.infer<typeof CourseTreeRootItemSchema>;
export type CourseTree = z.infer<typeof CourseTreeSchema>;
