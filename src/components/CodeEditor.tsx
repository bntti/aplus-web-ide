import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, useTheme } from '@mui/material';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useContext, useState } from 'react';
import { StreamLanguage } from '@codemirror/language';
import { scala } from '@codemirror/legacy-modes/mode/clike';

import { Navigate } from 'react-router-dom';
import { ApiTokenContext } from '../app/StateProvider';

const CodeEditor = ({ callback, exerciseId }: { callback: () => void; exerciseId: number }): JSX.Element => {
    const { apiToken } = useContext(ApiTokenContext);
    const theme = useTheme();

    const [code, setCode] = useState<string>('');
    const [language, setLanguage] = useState<string>('');

    const submitCode = (): void => {
        const formData = new FormData();
        formData.append('file1', new Blob([code]));
        axios
            .post(`/api/v2/exercises/${exerciseId}/submissions/submit`, formData, {
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
            <ReactCodeMirror
                value={code}
                height="55vh"
                onChange={(val) => {
                    setCode(val);
                }}
                theme={theme.palette.mode === 'dark' ? baseDarkTheme : baseLightTheme}
                extensions={[theme.palette.mode === 'dark' ? editorDarkTheme : editorLightTheme, ...getLanguage()]}
            />
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
                        <MenuItem value="">-</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="scala">Scala</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </>
    );
};

export default CodeEditor;
