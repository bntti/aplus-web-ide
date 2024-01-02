import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { scala } from '@codemirror/legacy-modes/mode/clike';
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Tab,
    Tabs,
    useTheme,
} from '@mui/material';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiTokenContext } from '../app/StateProvider';
import { ExerciseDataWithInfo, FileSpec } from '../app/api/exerciseTypes';

const guessLanguages = (portions: FileSpec[]): string[] => {
    return portions.map((portion) => {
        if (portion.title.endsWith('.js')) return 'javascript';
        else if (portion.title.endsWith('.py')) return 'python';
        else if (portion.title.endsWith('.scala')) return 'scala';
        return 'text';
    });
};

type Props =
    | {
          exercise: ExerciseDataWithInfo;
          callback: () => void;
          codes?: null | string[];
          readOnly?: false;
      }
    | {
          exercise: ExerciseDataWithInfo;
          callback?: null | (() => void);
          codes: null | string[];
          readOnly: true;
      };

const CodeEditor = ({
    exercise,
    callback = null,
    codes: defaultCodes = null,
    readOnly = false,
}: Props): JSX.Element => {
    if (exercise.exercise_info.form_spec.find((portion) => portion.type !== 'file')) {
        throw new Error("Exercise that wasn't a file was passed to CodeEditor");
    }
    const theme = useTheme();
    const { t } = useTranslation();
    const { apiToken } = useContext(ApiTokenContext);

    const portions: FileSpec[] = exercise.exercise_info.form_spec as unknown as FileSpec[];
    let storageEmpty = true;
    const storageCodes = [];
    for (let i = 0; i < portions.length; i++) {
        const storageCode = localStorage.getItem(`code-${exercise.id}-${i}`);
        if (storageCode) storageEmpty = false;

        if (storageCode) storageCodes.push(storageCode);
        else if (defaultCodes) storageCodes.push(defaultCodes[i]);
        else storageCodes.push('');
    }
    const [codes, setCodes] = useState<string[]>(storageEmpty ? defaultCodes || storageCodes : storageCodes);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [languages, setLanguages] = useState<string[]>(guessLanguages(portions));
    const [currentLanguage, setCurrentLanguage] = useState<string>(guessLanguages(portions)[0]);

    const submitCode = (): void => {
        const formData = new FormData();
        for (let i = 0; i < portions.length; i++) {
            formData.append(portions[i].key, new Blob([codes[i]]));
        }
        axios
            .post(`/api/v2/exercises/${exercise.id}/submissions/submit`, formData, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then(callback)
            .catch(console.error);
    };

    const getLanguage = (language: string): (LanguageSupport | StreamLanguage<unknown>)[] => {
        if (language === 'javascript') return [javascript()];
        else if (language === 'python') return [python()];
        else if (language === 'scala') return [StreamLanguage.define(scala)];
        return [];
    };

    const baseLightTheme = EditorView.theme({
        '&.cm-editor': {
            border: '1px solid rgba(0, 0, 0, 0.12)',
        },
        '&.cm-editor.cm-focused': {
            border: '1px solid rgba(0, 0, 0, 0.26)',
            outline: 'none',
        },
    });
    const baseDarkTheme = EditorView.theme({
        '&.cm-editor': {
            border: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '&.cm-editor.cm-focused': {
            border: '1px solid rgba(255, 255, 255, 0.16)',
            outline: 'none',
        },
    });
    const editorLightTheme = githubLight;
    const editorDarkTheme = githubDark;

    return (
        <>
            <Tabs
                TabIndicatorProps={{
                    style: { backgroundColor: '#ffffff00' },
                }}
                value={tabIndex}
                onChange={(_, value) => {
                    setTabIndex(value);
                    setCurrentLanguage(languages[value]);
                }}
                sx={{
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    border:
                        theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0,0,0,0.12)',
                    borderBottom: 'none',
                }}
            >
                {portions.map((portion, index) => (
                    <Tab
                        key={portion.key}
                        disableRipple={portions.length === 1}
                        label={portion.title}
                        sx={{
                            textTransform: 'none',
                            userSelect: 'none',
                            cursor: portions.length === 1 ? 'default' : 'pointer',
                        }}
                        value={index}
                    />
                ))}
            </Tabs>

            <ReactCodeMirror
                value={codes[tabIndex]}
                height="55vh"
                onChange={(val) => {
                    localStorage.setItem(`code-${exercise.id}-${tabIndex}`, val);
                    codes[tabIndex] = val;
                    setCodes(codes);
                }}
                readOnly={readOnly}
                theme={theme.palette.mode === 'dark' ? baseDarkTheme : baseLightTheme}
                extensions={[
                    theme.palette.mode === 'dark' ? editorDarkTheme : editorLightTheme,
                    ...getLanguage(currentLanguage),
                ]}
            />
            {!readOnly && (
                <Stack spacing={2} sx={{ mt: 2 }} direction="row" justifyContent="space-between">
                    <Button onClick={submitCode} variant="outlined">
                        {t('file-submit')}
                    </Button>
                    <FormControl variant="outlined" size="small">
                        <InputLabel id="programming-language-select">{t('language')}</InputLabel>
                        <Select
                            sx={{ minWidth: 150 }}
                            id="programming-language-select"
                            value={languages[tabIndex]}
                            label="Language"
                            onChange={(event: SelectChangeEvent) => {
                                languages[tabIndex] = event.target.value;
                                setCurrentLanguage(event.target.value);
                                setLanguages(languages);
                            }}
                        >
                            <MenuItem value="text">Text</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="scala">Scala</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            )}
        </>
    );
};

export default CodeEditor;
