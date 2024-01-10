import axios from 'axios';

import { ApiToken, User, UserSchema } from '../StateProvider';

export const getUser = async (apiToken: ApiToken): Promise<User> => {
    const userResponse = await axios.get('/api/v2/users/me', { headers: { Authorization: `Token ${apiToken}` } });

    return UserSchema.parse(userResponse.data);
};

export const getGraderToken = async (apiToken: ApiToken, courses: { id: number }[]): Promise<string> => {
    const graderTokenResponse = await axios.post(
        '/api/v2/get-token',
        {
            taud: 'grader',
            exp: '01:00:00',
            permissions: courses.map((course) => ['instance', 1, { id: course.id }]), // TODO: change 'instance' back to 'exercise'
        },
        { headers: { Authorization: `Token ${apiToken}` } },
    );
    return graderTokenResponse.request.response.replaceAll('"', '');
};
