import {
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
} from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';

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

type Props =
    | {
          exercise: ExerciseDataWithInfo;
          apiToken: string;
          callback: () => void;
          answers?: null | [string, string][];
          feedback?: null | { [key: string]: string[] };
          points?: null | { [key: string]: { points: number; max_points: number } };
          readOnly?: false;
      }
    | {
          exercise: ExerciseDataWithInfo;
          apiToken?: null;
          callback?: null;
          answers: [string, string][];
          feedback: { [key: string]: string[] };
          points: { [key: string]: { points: number; max_points: number } };
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
    readOnly = false,
}: Props): JSX.Element => {
    if (exercise.exercise_info.form_spec.find((portion) => portion.type === 'file')) {
        throw new Error('Tried to pass file type form to FormExercise');
    }

    const defaultValues = init(exercise, answers);

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

    const removeMargins = (value: string): string => {
        return value.replace(/<p>/g, '<p style="margin:0;">');
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
    const TextPortion = ({ portion }: { portion: TextSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string>(formValues[portion.key]);
        return (
            <TextField
                id={portion.key}
                aria-labelledby={portion.key}
                multiline={portion.type === 'textarea'}
                rows={portion.type === 'textarea' ? 5 : 1}
                type={portion.type === 'number' ? 'number' : 'text'}
                inputProps={{ step: 'any' }}
                required={portion.required}
                fullWidth
                value={localValue}
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

    const Portion = ({ portion }: { portion: FormSpec }): JSX.Element => {
        switch (portion.type) {
            case 'radio':
                return <RadioPortion portion={portion} />;
            case 'text':
                return <TextPortion portion={portion} />;
            case 'textarea':
                return <TextPortion portion={portion} />;
            case 'number':
                return <TextPortion portion={portion} />;
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
    return (
        <Container component={Paper} sx={{ pt: 2, pb: 2 }}>
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
                            error={(points && points[portion.key].points < points[portion.key].max_points) ?? false}
                        >
                            <Stack direction="row" spacing={1}>
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
                                    style={{ marginTop: 2, marginBottom: 1 }}
                                    dangerouslySetInnerHTML={{
                                        __html: removeMargins(translate(portion.description)),
                                    }}
                                />
                            )}
                            <Portion portion={portion} />
                            {feedback && portion.key in feedback && feedback[portion.key].length > 0 && (
                                <FormHelperText
                                    dangerouslySetInnerHTML={{ __html: feedback[portion.key].join('\n') }}
                                />
                            )}
                        </FormControl>
                    ),
                )}
                {!readOnly && <Button type="submit">Submit</Button>}
            </form>
        </Container>
    );
};
export default FormExercise;
