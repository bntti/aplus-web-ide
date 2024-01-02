import {
    Alert,
    AlertTitle,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import axios, { AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PointsChip from './PointsChip';
import { LanguageContext } from '../app/StateProvider';
import {
    CheckboxSpec,
    DropdownSpec,
    ExerciseDataWithInfo,
    FormSpec,
    RadioSpec,
    StaticSpec,
    TextSpec,
} from '../app/api/exerciseTypes';

const NoButtonsTextField = styled(TextField)(() => ({
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
        display: 'none',
    },
    '& input[type=number]': {
        MozAppearance: 'textfield',
    },
}));

type Props =
    | {
          exercise: ExerciseDataWithInfo;
          apiToken: string;
          callback: (response: AxiosResponse) => void;
          answers?: null | [string, string][];
          feedback?: null | { [key: string]: string[] };
          points?: null | { [key: string]: { points: number; max_points: number } };
          validationErrors?: null | { [key: string]: string[] };
          readOnly?: false;
      }
    | {
          exercise: ExerciseDataWithInfo;
          apiToken?: null | string;
          callback?: null | ((response: AxiosResponse) => void);
          answers?: null | [string, string][];
          feedback?: null | { [key: string]: string[] };
          points?: null | { [key: string]: { points: number; max_points: number } };
          validationErrors?: null | { [key: string]: string[] };
          readOnly: true;
      };
type CheckBoxValues = { [key: string]: { [key: string]: boolean } };
type FormValues = { [key: string]: string };

const init = (
    exercise: ExerciseDataWithInfo,
    answers: null | [string, string][],
): { formValues: FormValues; checkBoxValues: CheckBoxValues } => {
    const newAnswers: { [key: string]: string[] } = {};
    if (answers !== null) {
        for (const answer of answers) {
            if (answer[0] in newAnswers) newAnswers[answer[0]].push(answer[1]);
            else newAnswers[answer[0]] = [answer[1]];
        }
    }

    const formValues: { [key: string]: string } = {};
    for (const portion of exercise.exercise_info.form_spec) {
        if (portion.type === 'checkbox') continue;
        if (portion.key in newAnswers) {
            formValues[portion.key] = newAnswers[portion.key][0];
        } else if (portion.type === 'dropdown' || portion.type === 'radio') {
            formValues[portion.key] = portion.enum[0];
        } else if (portion.type === 'number' || portion.type === 'text' || portion.type === 'textarea') {
            formValues[portion.key] = '';
        }
    }
    const checkBoxValues: CheckBoxValues = {};
    for (const portion of exercise.exercise_info.form_spec) {
        if (portion.type !== 'checkbox') continue;

        checkBoxValues[portion.key] = {};
        for (const key of portion.enum) checkBoxValues[portion.key][key] = false;
        if (portion.key in newAnswers) {
            for (const answer of newAnswers[portion.key]) checkBoxValues[portion.key][answer] = true;
        }
    }

    return { formValues, checkBoxValues };
};

const FormExercise = ({
    exercise,
    apiToken = null,
    callback = null,
    answers = null,
    feedback = null,
    points = null,
    validationErrors = null,
    readOnly = false,
}: Props): JSX.Element => {
    if (exercise.exercise_info.form_spec.find((portion) => portion.type === 'file')) {
        throw new Error('Tried to pass file type form to FormExercise');
    }

    const defaultValues = init(exercise, answers);

    const { t } = useTranslation();
    const { language } = useContext(LanguageContext);
    const [formValues, setFormValues] = useState<FormValues>(defaultValues.formValues);
    const [checkboxValues, setcheckboxValues] = useState<CheckBoxValues>(defaultValues.checkBoxValues);

    const i18n = exercise.exercise_info.form_i18n;
    const translate = (value: string): string => {
        if (!(value in i18n) || (!('en' in i18n[value]) && !('fi' in i18n[value]))) return value;

        // Preferred language
        if (language === 'english' && 'en' in i18n[value]) return i18n[value].en;
        else if (language === 'finnish' && 'fi' in i18n[value]) return i18n[value].fi;

        // Fallback to other language
        if ('en' in i18n[value]) return i18n[value].en;
        else return i18n[value].fi;
    };

    const removeMargins = (value: string, error: boolean): string => {
        if (error) return value.replace(/<p/g, '<p style="margin:0;color:red"');
        return value.replace(/<p/g, '<p style="margin:0"');
    };

    const RadioPortion = ({ portion }: { portion: RadioSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string | undefined>(formValues[portion.key]);
        return (
            <RadioGroup
                id={portion.key}
                aria-labelledby={portion.key}
                value={localValue}
                onChange={(_, value: string) => {
                    setLocalValue(value);
                    formValues[portion.key] = value;
                    setFormValues(formValues);
                }}
            >
                {Object.entries(portion.titleMap).map(([key, value]) => (
                    <FormControlLabel
                        key={key}
                        value={key}
                        disabled={readOnly}
                        control={<Radio required={portion.required} />}
                        label={translate(value)}
                    />
                ))}
            </RadioGroup>
        );
    };
    const TextPortion = ({ portion, error }: { portion: TextSpec; error: boolean }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string>(formValues[portion.key]);
        return (
            <NoButtonsTextField
                id={portion.key}
                aria-labelledby={portion.key}
                multiline={portion.type === 'textarea'}
                rows={portion.type === 'textarea' ? 5 : 1}
                type={portion.type === 'number' ? 'number' : 'text'}
                inputProps={{ step: 'any' }}
                required={portion.required}
                fullWidth
                value={localValue}
                error={error}
                disabled={readOnly}
                onChange={(event) => {
                    setLocalValue(event.target.value);
                    formValues[portion.key] = event.target.value;
                    setFormValues(formValues);
                }}
            />
        );
    };
    const DropdownPortion = ({ portion }: { portion: DropdownSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string>(formValues[portion.key]);
        return (
            <Select
                id={portion.key}
                labelId={portion.key}
                value={localValue}
                required={portion.required}
                fullWidth
                disabled={readOnly}
                onChange={(event) => {
                    setLocalValue(event.target.value);
                    formValues[portion.key] = event.target.value;
                    setFormValues(formValues);
                }}
            >
                {Object.entries(portion.titleMap).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                        {translate(value)}
                    </MenuItem>
                ))}
            </Select>
        );
    };
    const CheckboxPortion = ({ portion }: { portion: CheckboxSpec }): JSX.Element => {
        type LocalState = { [key: string]: boolean };
        const [localValue, setLocalValue] = useState<LocalState>(checkboxValues[portion.key]);
        return (
            <FormGroup id={portion.key} aria-labelledby={portion.key}>
                {Object.entries(portion.titleMap).map(([key, value]) => (
                    <FormControlLabel
                        id={key}
                        key={key}
                        disabled={readOnly}
                        control={
                            <Checkbox
                                checked={localValue[key]}
                                onChange={(event) => {
                                    const newVal = { ...localValue };
                                    newVal[key] = event.target.checked;
                                    setLocalValue(newVal);

                                    checkboxValues[portion.key] = newVal;
                                    setcheckboxValues(checkboxValues);
                                }}
                                required={portion.required}
                            />
                        }
                        label={translate(value)}
                    />
                ))}
            </FormGroup>
        );
    };

    const Portion = ({ portion, error }: { portion: FormSpec; error: boolean }): JSX.Element => {
        switch (portion.type) {
            case 'radio':
                return <RadioPortion portion={portion} />;
            case 'text':
                return <TextPortion portion={portion} error={error} />;
            case 'textarea':
                return <TextPortion portion={portion} error={error} />;
            case 'number':
                return <TextPortion portion={portion} error={error} />;
            case 'dropdown':
                return <DropdownPortion portion={portion} />;
            case 'checkbox':
                return <CheckboxPortion portion={portion} />;
        }
    };

    useEffect(() => {
        if (window?.MathJax !== undefined) {
            window.MathJax.typeset();
        }
    });

    const handleSubmit = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const formData = new FormData();
        for (const [portionKey, selectedValue] of Object.entries(formValues)) {
            formData.append(portionKey, selectedValue);
        }
        for (const [portionKey, values] of Object.entries(checkboxValues)) {
            for (const [key, checked] of Object.entries(values)) {
                if (checked === true) formData.append(portionKey, key);
            }
        }

        axios
            .post(`/api/v2/exercises/${exercise.id}/submissions/submit`, formData, {
                headers: { Authorization: `Token ${apiToken}` },
            })
            .then(callback)
            .catch(console.error);
    };

    type PortionType = (FormSpec | StaticSpec)[];
    const portions: PortionType = exercise.exercise_info.form_spec as unknown as PortionType;

    const portionTitles: { [key: string]: string } = {};
    for (const portion of portions) {
        if (portion.type !== 'static') portionTitles[portion.key] = portion.title;
    }

    const combinedFeedback: { [key: string]: string[] } = {};
    if (validationErrors) {
        for (const [key, error] of Object.entries(validationErrors)) combinedFeedback[key] = error;
    }
    if (feedback) {
        for (const [key, feedbackText] of Object.entries(feedback)) {
            combinedFeedback[key] = [...(combinedFeedback[key] ?? []), ...feedbackText];
        }
    }

    return (
        <Container component={Paper} sx={{ pt: 2, pb: 2 }}>
            {validationErrors && (
                <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>{t('submission-failed-due-to')}</AlertTitle>
                    {Object.entries(validationErrors).map(([key, error]) => (
                        <Typography variant="body2" key={`validation-${key}`}>
                            {portionTitles[key]}: {error}
                        </Typography>
                    ))}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                {portions.map((portion) =>
                    portion.type === 'static' ? (
                        portion.description && (
                            <div
                                key={portion.key}
                                dangerouslySetInnerHTML={{ __html: translate(portion.description) }}
                            />
                        )
                    ) : (
                        <FormControl
                            sx={{ mb: 3, display: 'block' }}
                            key={portion.key}
                            error={!!validationErrors && portion.key in validationErrors}
                        >
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                                {points && (
                                    <PointsChip
                                        points={points[portion.key].points}
                                        maxPoints={points[portion.key].max_points}
                                        size="small"
                                    />
                                )}
                            </Stack>
                            {portion.description && (
                                <div
                                    style={{ marginTop: 1, marginBottom: 1 }}
                                    dangerouslySetInnerHTML={{
                                        __html: removeMargins(
                                            translate(portion.description),
                                            !!validationErrors && portion.key in validationErrors,
                                        ),
                                    }}
                                />
                            )}
                            <Portion portion={portion} error={!!validationErrors && portion.key in validationErrors} />
                            {portion.key in combinedFeedback && combinedFeedback[portion.key].length > 0 && (
                                <FormHelperText
                                    variant="standard"
                                    dangerouslySetInnerHTML={{ __html: combinedFeedback[portion.key].join('\n') }}
                                />
                            )}
                        </FormControl>
                    ),
                )}
                {!readOnly && <Button type="submit">{t('submit-form')}</Button>}
            </form>
        </Container>
    );
};
export default FormExercise;
