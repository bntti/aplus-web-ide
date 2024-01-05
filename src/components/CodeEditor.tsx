import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { scala } from '@codemirror/legacy-modes/mode/clike';
import { FileDownload, FileUpload } from '@mui/icons-material';
import {
    Button,
    ButtonGroup,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Tab,
    Tabs,
    styled,
    useTheme,
} from '@mui/material';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UploadFileConfirmDialog from './UploadFileConfirmDialog';
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

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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

const getInitCodes = (exercise: ExerciseDataWithInfo, readOnly: boolean, defaultCodes: string[] | null): string[] => {
    if (readOnly) return defaultCodes as string[];

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
    return storageEmpty ? defaultCodes || storageCodes : storageCodes;
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
          codes: string[];
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
    const portions: FileSpec[] = exercise.exercise_info.form_spec as unknown as FileSpec[];

    const theme = useTheme();
    const { t } = useTranslation();
    const { apiToken } = useContext(ApiTokenContext);

    const [codes, setCodes] = useState<string[]>(getInitCodes(exercise, readOnly, defaultCodes));
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [languages, setLanguages] = useState<string[]>(guessLanguages(portions));
    const [currentLanguage, setCurrentLanguage] = useState<string>(guessLanguages(portions)[0]);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadConfirm, setUploadConfirm] = useState<boolean>(false);

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

    const downloadCodeAsFile = (): void => {
        // TODO: check that works for all browsers and older firefox
        const element = document.createElement('a');
        const file = new Blob([codes[tabIndex]], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = portions[tabIndex].title;
        element.click();
    };
    const applyUploadedCode = (): void => {
        if (!uploadFile) throw new Error('Uploaded code is null');

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target?.result as string;
            localStorage.setItem(`code-${exercise.id}-${tabIndex}`, fileContent);
            const newCodes = [...codes];
            newCodes[tabIndex] = fileContent;
            setCodes(newCodes);
        };
        reader.readAsText(uploadFile);
    };

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

            <UploadFileConfirmDialog
                file={uploadFile}
                callback={applyUploadedCode}
                open={uploadConfirm}
                handleClose={() => setUploadConfirm(false)}
            />
            {readOnly ? (
                <Button sx={{ mt: 1 }} variant="outlined" onClick={downloadCodeAsFile} startIcon={<FileDownload />}>
                    {t('download-code')}
                </Button>
            ) : (
                <Stack spacing={2} sx={{ mt: 2 }} direction="row" justifyContent="space-between">
                    <Button onClick={submitCode} variant="outlined">
                        {t('file-submit')}
                    </Button>
                    <ButtonGroup>
                        <Button variant="outlined" onClick={downloadCodeAsFile} startIcon={<FileDownload />}>
                            {t('download-code')}
                        </Button>
                        <Button component="label" variant="outlined" startIcon={<FileUpload />}>
                            {t('upload-code')}
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(event) => {
                                    if (event.target.files && event.target.files.length === 1) {
                                        setUploadFile(event.target.files[0]);
                                        setUploadConfirm(true);
                                    }
                                }}
                            />
                        </Button>
                    </ButtonGroup>
                    <FormControl variant="outlined" size="small">
                        <InputLabel id="programming-language-select">{t('language')}</InputLabel>
                        <Select
                            sx={{ minWidth: 150 }}
                            id="programming-language-select"
                            value={languages[tabIndex]}
                            label={t('language')}
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
