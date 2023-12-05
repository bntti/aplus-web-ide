import { AxiosError } from 'axios';
import { NavigateFunction } from 'react-router-dom';

export const catcher = (navigate: NavigateFunction, error: AxiosError): never => {
    const details = JSON.parse(error.request.response).detail;
    if (details === 'Invalid token.') {
        navigate('/logout');
        throw new Error('Invalid api Token, redirecting to /logout');
    } else throw error;
};
