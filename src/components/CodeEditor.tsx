import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { StreamLanguage } from '@codemirror/language';
import { scala } from '@codemirror/legacy-modes/mode/clike';
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useContext, useState } from 'react';

import { Navigate } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';
import { ExerciseWithInfo, FileSpec } from '../routes/exerciseTypes';

type Props =
    | {
          exercise: ExerciseWithInfo;
          callback: () => void;
          code?: string;
          readOnly?: false;
      }
    | { exercise: ExerciseWithInfo; callback?: null; code: string; readOnly: true };

const getLanguageFromFilename = (filename: string): string => {
    if (filename.endsWith('.js')) return 'javascript';
    else if (filename.endsWith('.py')) return 'python';
    else if (filename.endsWith('.scala')) return 'scala';
    return 'text';
};

const CodeEditor = ({ exercise, callback = null, code: defaultCode = '', readOnly = false }: Props): JSX.Element => {
    if (exercise.exercise_info.form_spec[0].type !== 'file') {
        throw new Error("Exercise that wasn't a file was passed to CodeEditor");
    }

    const { apiToken } = useContext(ApiTokenContext);
    const theme = useTheme();

    const filename = exercise.exercise_info.form_spec[0].title;
    const storageCode = localStorage.getItem(`${exercise.id}`);
    const [code, setCode] = useState<string>((!readOnly && storageCode) || defaultCode);
    const [language, setLanguage] = useState<string>(getLanguageFromFilename(filename));

    const submitCode = (): void => {
        const formData = new FormData();
        const formKey = (exercise.exercise_info.form_spec[0] as FileSpec).key;
        formData.append(formKey, new Blob([code]));
        axios
            .post(`/api/v2/exercises/${exercise.id}/submissions/submit`, formData, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then(callback)
            .catch(console.error);
    };

    // eslint-disable-next-line
    const getLanguage = (): any[] => {
        if (language === 'javascript') return [javascript()];
        else if (language === 'python') return [python()];
        else if (language === 'scala') return [StreamLanguage.define(scala)];
        return [];
    };

    const baseLightTheme = EditorView.theme({
        '&.cm-editor': {
            outline: '1px solid rgba(0, 0, 0, 0.12)',
        },
        '&.cm-editor.cm-focused': {
            outline: '1px solid rgba(0, 0, 0, 0.26)',
        },
    });
    const baseDarkTheme = EditorView.theme({
        '&.cm-editor': {
            outline: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '&.cm-editor.cm-focused': {
            outline: '1px solid rgba(255, 255, 255, 0.16)',
        },
    });
    const editorLightTheme = githubLight;
    const editorDarkTheme = githubDark;

    if (apiToken === null) return <Navigate replace to="/courses" />;
    return (
        <>
            <Typography sx={{ mb: 0.25 }}>{exercise.exercise_info.form_spec[0].title}</Typography>
            <ReactCodeMirror
                value={code}
                height="55vh"
                onChange={(val) => {
                    localStorage.setItem(`${exercise.id}`, val);
                    setCode(val);
                }}
                readOnly={readOnly}
                theme={theme.palette.mode === 'dark' ? baseDarkTheme : baseLightTheme}
                extensions={[theme.palette.mode === 'dark' ? editorDarkTheme : editorLightTheme, ...getLanguage()]}
            />
            {!readOnly && (
                <Stack spacing={2} sx={{ mt: 2 }} direction="row" justifyContent="space-between">
                    <Button onClick={submitCode} variant="outlined">
                        Submit
                    </Button>
                    <FormControl variant="outlined" size="small">
                        <InputLabel id="programming-language-select">Language</InputLabel>
                        <Select
                            sx={{ minWidth: 150 }}
                            id="programming-language-select"
                            value={language}
                            label="Language"
                            onChange={(event: SelectChangeEvent) => setLanguage(event.target.value)}
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
