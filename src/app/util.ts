import axios, { AxiosError } from 'axios';
import { Dispatch, SetStateAction, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';

export const apiCatcher = (navigate: NavigateFunction, error: AxiosError): never => {
    const details = JSON.parse(error.request.response).detail;
    if (details === 'Invalid token.') {
        navigate('/logout');
        throw new Error('Invalid api Token, redirecting to /logout');
    } else throw error;
};

export const checkError = (error: unknown): boolean => {
    return axios.isAxiosError(error) && JSON.parse(error.request.response).detail;
};

export const parseTitle = (name: string, language: 'english' | 'finnish'): string => {
    const regexp = /([^|]*)\|en:([^|]*)\|fi:([^|]*)\|/;
    const matches = name.match(regexp);
    if (language === 'english') return matches ? matches[1] + matches[2] : name;
    else if (language === 'finnish') return matches ? matches[1] + matches[3] : name;
    throw new Error(`Invalid language ${language}`);
};

// TODO: support other languages
export const translateI18n = (
    value: string,
    i18n: { [key: string]: { en: string; fi?: string } | { en?: string; fi: string } },
    language: 'english' | 'finnish',
): string => {
    if (!(value in i18n) || (!i18n[value]?.en && !i18n[value]?.fi)) return value;
    const i18nValue = i18n[value];

    // Preferred language
    if (language === 'english' && i18nValue?.en) return i18nValue.en;
    else if (language === 'finnish' && i18nValue?.fi) return i18nValue.fi;

    // Fallback to other language
    if (i18nValue?.en) return i18nValue.en;
    else return i18nValue.fi as string;
};

export const usePersistantState = <T>(
    key: string,
    initialValue: T,
    schema: { parse: (value: object | string) => T },
): [T, Dispatch<SetStateAction<T>>] => {
    let initValue = initialValue;
    try {
        const value = localStorage.getItem(key);
        if (value) initValue = schema.parse(JSON.parse(value));
    } catch (e) {
        console.error(e);
        localStorage.removeItem(key);
    }
    const [state, setInternalState] = useState<T>(initValue);

    type StateFunction = (prevState: T) => T;
    const setState = (value: T | StateFunction): void => {
        const actualValue = typeof value === 'function' ? (value as StateFunction)(state) : value;
        localStorage.setItem(key, JSON.stringify(actualValue));
        setInternalState(actualValue);
    };

    return [state, setState];
};
