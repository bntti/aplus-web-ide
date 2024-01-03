import { AxiosError } from 'axios';
import { NavigateFunction } from 'react-router-dom';

export const apiCatcher = (navigate: NavigateFunction, error: AxiosError): never => {
    const details = JSON.parse(error.request.response).detail;
    if (details === 'Invalid token.') {
        navigate('/logout');
        throw new Error('Invalid api Token, redirecting to /logout');
    } else throw error;
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
