import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';

import {
    CourseData,
    CourseDataSchema,
    CoursePointsData,
    CoursePointsSchema,
    CourseTree,
    CourseTreeSchema,
    Exercises,
    ExercisesSchema,
} from './courseTypes';
import { ApiToken } from '../StateProvider';
import { apiCatcher } from '../util';

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

export const getCoursePoints: CourseFunction<CoursePointsData> = async (apiToken, courseId, navigate) => {
    const pointsResponse = await axios
        .get(`/api/v2/courses/${courseId}/points/me`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));

    return CoursePointsSchema.parse(pointsResponse.data);
};

export const getCourseTree: CourseFunction<CourseTree> = async (apiToken, courseId, navigate) => {
    const courseTreeResponse = await axios
        .get(`/api/v2/courses/${courseId}/tree`, {
            headers: { Authorization: `Token ${apiToken}` },
        })
        .catch((error) => apiCatcher(navigate, error));

    return CourseTreeSchema.parse(courseTreeResponse.data);
};
