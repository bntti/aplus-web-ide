import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { catcher } from './util';
import { ApiTokenN } from '../StateProvider';

const CourseDataSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
});
export type CourseData = z.infer<typeof CourseDataSchema>;

const CoursePointsSchema = z.object({
    points: z.number().int().nonnegative(),
    modules: z.array(
        z.object({
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
        }),
    ),
});
export type CoursePoints = z.infer<typeof CoursePointsSchema>;

// TODO: Has fields next and previous, might be necessary on bigger courses?
const ExercisesSchema = z.object({
    results: z.array(
        z.object({
            exercises: z.array(
                z.object({ id: z.number().int().nonnegative(), max_submissions: z.number().int().nonnegative() }),
            ),
        }),
    ),
});

type Exercises = z.infer<typeof ExercisesSchema>;

export const getCourse = async (
    apiToken: ApiTokenN,
    courseId: string | number,
    navigate: NavigateFunction,
): Promise<CourseData | never> => {
    const courseResponse = await axios
        .get(`/api/v2/courses/${courseId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));

    return CourseDataSchema.parse(courseResponse.data);
};

export const getExercises = async (
    apiToken: ApiTokenN,
    courseId: string | number,
    navigate: NavigateFunction,
): Promise<Exercises | never> => {
    const exerciseResponse = await axios
        .get(`/api/v2/courses/${courseId}/exercises`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));

    return ExercisesSchema.parse(exerciseResponse.data);
};

export const getCoursePoints = async (
    apiToken: ApiTokenN,
    courseId: string | number,
    navigate: NavigateFunction,
): Promise<CoursePoints | never> => {
    const pointsResponse = await axios
        .get(`/api/v2/courses/${courseId}/points/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => catcher(navigate, error));

    return CoursePointsSchema.parse(pointsResponse.data);
};
