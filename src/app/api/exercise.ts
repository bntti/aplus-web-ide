import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { ExerciseData, ExerciseDataSchema } from './exerciseTypes';
import { catcher } from './util';
import { ApiTokenN, GraderToken } from '../StateProvider';

const SubmitterStatsSchema = z.object({
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

const SubmissionsSchema = z.object({
    results: z.array(
        z.object({
            id: z.number().int().nonnegative(),
            grade: z.number().int().nonnegative(),
            submission_time: z.string().datetime({ precision: 6, offset: true }).pipe(z.coerce.date()),
        }),
    ),
});
export type Submissions = z.infer<typeof SubmissionsSchema>;

type ExerciseFunction<T> = (apiToken: ApiTokenN, exerciseId: string | number, navigate: NavigateFunction) => Promise<T>;

export const getSubmitterStats: ExerciseFunction<SubmitterStats> = async (apiToken, exerciseId, navigate) => {
    const submitterStatsResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));
    return SubmitterStatsSchema.parse(submitterStatsResponse.data);
};

export const getSubmissions: ExerciseFunction<Submissions> = async (apiToken, exerciseId, navigate) => {
    const submissionsResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}/submissions/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));
    return SubmissionsSchema.parse(submissionsResponse.data);
};

export const getExercise: ExerciseFunction<ExerciseData> = async (apiToken, exerciseId, navigate) => {
    const exerciseResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })

        .catch((error) => catcher(navigate, error));
    return ExerciseDataSchema.parse(exerciseResponse.data);
};

export const getTemplates = async (graderToken: GraderToken, templateNames: string[]): Promise<string[]> => {
    if (!graderToken) throw new Error('Invalid courseId / apiToken');

    const templates = [];
    for (const template of templateNames) {
        const templateResponse = await axios.get(
            template.replace('http://grader:8080', '/grader'), // TODO: change in prod?
            { headers: { Authorization: `Bearer ${graderToken}` } },
        );
        templates.push(templateResponse.data);
    }
    return templates;
};
