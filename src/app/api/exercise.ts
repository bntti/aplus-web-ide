import axios, { AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { ExerciseData, ExerciseDataSchema } from './exerciseTypes';
import { getGraderToken } from './login';
import { ApiToken, GraderToken, User } from '../StateProvider';
import { apiCatcher } from '../util';

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

type ExerciseFunction<T> = (apiToken: ApiToken, exerciseId: string | number, navigate: NavigateFunction) => Promise<T>;

export const getSubmitterStats: ExerciseFunction<SubmitterStats> = async (apiToken, exerciseId, navigate) => {
    const submitterStatsResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}/submitter_stats/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));
    return SubmitterStatsSchema.parse(submitterStatsResponse.data);
};

export const getSubmissions: ExerciseFunction<Submissions> = async (apiToken, exerciseId, navigate) => {
    const submissionsResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}/submissions/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));
    return SubmissionsSchema.parse(submissionsResponse.data);
};

export const getExercise: ExerciseFunction<ExerciseData> = async (apiToken, exerciseId, navigate) => {
    const exerciseResponse = await axios
        .get(`/api/v2/exercises/${exerciseId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })

        .catch((error) => apiCatcher(navigate, error));
    return ExerciseDataSchema.parse(exerciseResponse.data);
};

export const getTemplates = async (
    graderToken: GraderToken,
    apiToken: string,
    user: User,
    templateNames: string[],
    navigate: NavigateFunction,
    setGraderToken: (value: string) => void,
    isRetry = false,
): Promise<string[]> => {
    if (!graderToken) throw new Error('Invalid courseId / apiToken');

    const templates = [];
    for (const template of templateNames) {
        let retry = false;
        const templateResponse = await axios
            .get(
                template.replace('http://grader:8080', '/grader'), // TODO: change in prod?
                { headers: { Authorization: `Bearer ${graderToken}` } },
            )
            .catch(async (error) => {
                if (error.response.data !== 'Expired token') {
                    throw new Error(`Unknown error with grader ${error.response.data}`);
                }
                if (isRetry) {
                    navigate('/logout', { state: { force: true } });
                    throw new Error('Failed to fetch templates with updated grader token, redirecting to logout');
                }
                retry = true;
                console.warn('Failed to fetch templates: grader token expired, trying again with a new one');
            });
        if (retry) {
            const newGraderToken = await getGraderToken(apiToken, user.enrolled_courses);
            setGraderToken(newGraderToken);

            return await getTemplates(newGraderToken, apiToken, user, templateNames, navigate, setGraderToken, true);
        }
        templates.push((templateResponse as AxiosResponse).data);
    }
    return templates;
};
