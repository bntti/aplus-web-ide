import { Params, redirect } from 'react-router-dom';

import { ApiToken, ApiTokenSchema } from './StateProvider';
import { getCourse, getCoursePoints, getCourseTree, getExercises } from './api/course';
import { CourseData, CoursePointsData, CourseTree, Exercises } from './api/courseTypes';

class Auth {
    apiToken: ApiToken | null = null;

    constructor() {
        try {
            const value = localStorage.getItem('apiToken');
            if (value) this.apiToken = ApiTokenSchema.parse(JSON.parse(value));
        } catch (e) {
            console.error(e);
            localStorage.removeItem('apiToken');
        }
    }

    signIn(apiToken: string): void {
        this.apiToken = apiToken;
    }
    signOut(): void {
        this.apiToken = null;
    }

    async getCourseData({
        params,
    }: {
        params: Params<string>;
    }): Promise<{ course: CourseData; courseTree: CourseTree } | Response> {
        if (this.apiToken === null) return redirect('/logout');
        if (params.courseId === undefined) return redirect('/');

        const course = await getCourse(this.apiToken, parseInt(params.courseId));
        const courseTree = await getCourseTree(this.apiToken, parseInt(params.courseId));

        if (course === null || courseTree === null) return redirect('/logout');
        return { course, courseTree };
    }

    async getCoursePointsData({
        params,
    }: {
        params: Params<string>;
    }): Promise<{ coursePoints: CoursePointsData; exercises: Exercises } | Response> {
        if (this.apiToken === null) return redirect('/logout');
        if (params.courseId === undefined) return redirect('/');

        const coursePoints = await getCoursePoints(this.apiToken, parseInt(params.courseId));
        const exercises = await getExercises(this.apiToken, parseInt(params.courseId));

        if (coursePoints === null || exercises === null) return redirect('/logout');
        return { coursePoints, exercises };
    }
}

export const auth = new Auth();
