import axios from 'axios';

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
import { checkError } from '../util';

type CourseFunction<T> = (apiToken: ApiToken, courseId: string | number) => Promise<T | null>;
const headers = (apiToken: string): { headers: { Authorization: string } } => ({
    headers: { Authorization: `Token ${apiToken}` },
});

export const getCourse: CourseFunction<CourseData> = async (apiToken, courseId) => {
    try {
        const courseResponse = await axios.get(`/api/v2/courses/${courseId}`, headers(apiToken));
        return CourseDataSchema.parse(courseResponse.data);
    } catch (error) {
        if (checkError(error)) return null;
        throw error;
    }
};

export const getExercises: CourseFunction<Exercises> = async (apiToken, courseId) => {
    try {
        const exerciseResponse = await axios.get(`/api/v2/courses/${courseId}/exercises`, headers(apiToken));
        return ExercisesSchema.parse(exerciseResponse.data);
    } catch (error) {
        if (checkError(error)) return null;
        throw error;
    }
};

export const getCoursePoints: CourseFunction<CoursePointsData> = async (apiToken, courseId) => {
    try {
        const pointsResponse = await axios.get(`/api/v2/courses/${courseId}/points/me`, headers(apiToken));
        return CoursePointsSchema.parse(pointsResponse.data);
    } catch (error) {
        if (checkError(error)) return null;
        throw error;
    }
};

export const getCourseTree: CourseFunction<CourseTree> = async (apiToken, courseId) => {
    try {
        const courseTreeResponse = await axios.get(`/api/v2/courses/${courseId}/tree`, headers(apiToken));
        return CourseTreeSchema.parse(courseTreeResponse.data);
    } catch (error) {
        if (checkError(error)) return null;
        throw error;
    }
};
