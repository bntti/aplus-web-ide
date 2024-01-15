import { Params, redirect } from 'react-router-dom';

import { ApiToken, ApiTokenSchema, GraderToken, GraderTokenSchema } from './StateProvider';
import { getCourse, getCoursePoints, getCourseTree, getExercises } from './api/course';
import { CourseData, CoursePointsData, CourseTree, Exercises } from './api/courseTypes';
import { getMaterialHtml } from './api/exercise';
import { parseTitle } from './util';

class Auth {
    apiToken: ApiToken | null = null;
    graderToken: GraderToken | null = null;

    constructor() {
        try {
            const storageApiToken = localStorage.getItem('apiToken');
            const storageGraderToken = localStorage.getItem('graderToken');
            if (storageApiToken) this.apiToken = ApiTokenSchema.parse(JSON.parse(storageApiToken));
            if (storageGraderToken) this.graderToken = GraderTokenSchema.parse(JSON.parse(storageGraderToken));
        } catch (e) {
            console.error(e);
            localStorage.removeItem('apiToken');
            localStorage.removeItem('graderToken');
        }
    }

    signIn(apiToken: ApiToken, graderToken: GraderToken): void {
        this.apiToken = apiToken;
        this.graderToken = graderToken;
    }
    signOut(): void {
        this.apiToken = null;
        this.graderToken = null;
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

    async getChapterHTML({ params }: { params: Params<string> }): Promise<{ chapterHtml: string[] } | Response> {
        if (this.apiToken === null || this.graderToken === null) return redirect('/logout');
        if (params.courseId === undefined) return redirect('/');
        if (params.moduleId === undefined || params.chapterId === undefined)
            return redirect(`/course/${params.courseId}`);

        const courseTree = await getCourseTree(this.apiToken, parseInt(params.courseId));
        if (!courseTree) return redirect('/logout');

        let chapter = null;
        for (const rootItem of courseTree.modules) {
            if (rootItem.id !== parseInt(params.moduleId)) continue;
            for (const chapterItem of rootItem.children) {
                if (chapterItem.id === parseInt(params.chapterId)) chapter = chapterItem;
            }
        }
        if (chapter === null) return redirect('/logout');

        let cleanTitle = parseTitle(chapter.name, 'english');
        if (cleanTitle.match(/\d\.\d/)) cleanTitle = cleanTitle.split(' ').slice(1).join(' ');
        const chapterHtml = await getMaterialHtml(this.graderToken, cleanTitle);

        if (chapterHtml === null) return redirect('/logout');
        return { chapterHtml };
    }
}

export const auth = new Auth();
