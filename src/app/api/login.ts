import axios from 'axios';

import { ApiTokenN, UserN, UserSchema } from '../StateProvider';

export const getUser = async (apiToken: ApiTokenN): Promise<UserN> => {
    const userResponse = await axios.get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } });

    return UserSchema.parse(userResponse.data);
};

export const getGraderToken = async (apiToken: ApiTokenN, courses: { id: number }[]): Promise<string> => {
    const graderTokenResponse = await axios.post(
        '/api/v2/get-token',
        {
            taud: 'grader',
            exp: '01:00:00',
            permissions: courses.map((course) => ['exercise', 1, { id: course.id }]),
        },
        { headers: { Authorization: `Token ${apiToken}` } },
    );
    return graderTokenResponse.request.response.replaceAll('"', '');
};
