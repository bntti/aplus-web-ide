import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';

import { ApiToken } from '../StateProvider';
import { apiCatcher } from '../util';

const CourseDataSchema = z.object({
    id: z.number().int().nonnegative(),
    name: z.string(),
});
export type CourseData = z.infer<typeof CourseDataSchema>;

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

const CoursePointsSchema = z.object({
    points: z.number().int().nonnegative(),
    modules: z.array(CourseModuleSchema),
});
export type CourseModuleData = z.infer<typeof CourseModuleSchema>;
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

type CourseFunction<T> = (apiToken: ApiToken, courseId: string | number, navigate: NavigateFunction) => Promise<T>;

export const getCourse: CourseFunction<CourseData> = async (apiToken, courseId, navigate) => {
    const courseResponse = await axios
        .get(`/api/v2/courses/${courseId}`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));

    return CourseDataSchema.parse(courseResponse.data);
};

export const getExercises: CourseFunction<Exercises> = async (apiToken, courseId, navigate) => {
    const exerciseResponse = await axios
        .get(`/api/v2/courses/${courseId}/exercises`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));

    return ExercisesSchema.parse(exerciseResponse.data);
};

export const getCoursePoints: CourseFunction<CoursePoints> = async (apiToken, courseId, navigate) => {
    const pointsResponse = await axios
        .get(`/api/v2/courses/${courseId}/points/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));

    return CoursePointsSchema.parse(pointsResponse.data);
};
