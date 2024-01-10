import axios, { AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';

import {
    APlusJsonSchema,
    ExerciseData,
    ExerciseDataSchema,
    Submissions,
    SubmissionsSchema,
    SubmitterStats,
    SubmitterStatsSchema,
} from './exerciseTypes';
import { getGraderToken } from './login';
import { ApiToken, GraderToken, User } from '../StateProvider';
import { apiCatcher } from '../util';

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

// TODO: use API
// No catch because dev, will fail on grader token expiry
export const getMaterialHtml = async (graderToken: GraderToken, chapterName: string): Promise<string[] | null> => {
    const materialResponse = await axios.get('/grader/default/aplus-json', {
        headers: { Authorization: `Bearer ${graderToken}` },
    });
    const material = APlusJsonSchema.parse(materialResponse.data);
    let chapterMaterial = null;
    for (const module of material.modules) {
        for (const chapter of module.children) {
            if (chapter.name === chapterName) chapterMaterial = chapter;
        }
    }
    if (chapterMaterial === null) return null;
    const htmlResponse = await axios.get(chapterMaterial.url.replace('http://localhost:8080', '/grader'), {
        headers: { Authorization: `Bearer ${graderToken}` },
    });

    const parser = new DOMParser();
    const fullDoc = parser.parseFromString(htmlResponse.data, 'text/html');
    const chapterContent = fullDoc.querySelector('.content')?.innerHTML;
    if (!chapterContent) return null;

    const innerDoc = parser.parseFromString(chapterContent, 'text/html');
    const htmlList = [];
    let collector = '';
    const walkDom = (node: Node): void => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (element.classList.contains('exercise')) {
                if (collector !== '') htmlList.push(collector);
                collector = '';
            } else {
                const attributeNames = element.getAttributeNames();
                const attributes = attributeNames.map((name) => `${name}="${element.getAttribute(name)}"`).join(' ');
                collector += `<${element.tagName} ${attributes}>`;
                for (const child of element.childNodes) walkDom(child);
                collector += `</${element.tagName}>`;
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            collector += (node as Text).textContent || '';
        }
    };
    walkDom(innerDoc.body);
    if (collector !== '') htmlList.push(collector);
    return htmlList;
};
