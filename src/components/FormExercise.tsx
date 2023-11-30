import {
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';

import { LanguageContext } from '../app/StateProvider';
import {
    CheckboxSpec,
    DropdownSpec,
    ExerciseWithInfo,
    FormSpec,
    RadioSpec,
    StaticSpec,
    TextSpec,
} from '../routes/exerciseTypes';

type Props = { exercise: ExerciseWithInfo; apiToken: string; callback: () => void };
type CheckBoxValues = { [key: string]: { key: string; value: string; checked: boolean }[] };

const getDefaultFormValues = (exercise: ExerciseWithInfo): { [key: string]: string } => {
    const defaultFormValues: { [key: string]: string } = {};
    for (const portion of exercise.exercise_info.form_spec) {
        if (portion.type === 'dropdown' || portion.type === 'radio') {
            defaultFormValues[portion.key] = portion.enum[0];
        }
    }
    return defaultFormValues;
};

const getDefaultCheckboxValues = (exercise: ExerciseWithInfo): CheckBoxValues => {
    const defaultFormCheckboxValues: CheckBoxValues = {};
    for (const portion of exercise.exercise_info.form_spec) {
        if (portion.type === 'checkbox') {
            defaultFormCheckboxValues[portion.key] = [];
            for (const [key, value] of Object.entries(portion.titleMap)) {
                defaultFormCheckboxValues[portion.key].push({ key, value, checked: false });
            }
        }
    }
    return defaultFormCheckboxValues;
};

const FormExercise = ({ exercise, apiToken, callback }: Props): JSX.Element => {
    if (exercise.exercise_info.form_spec.find((portion) => portion.type === 'file')) {
        throw new Error('Tried to pass file type form to FormExercise');
    }

    const { language } = useContext(LanguageContext);
    const [formValues, setFormValues] = useState<{ [key: string]: string }>(getDefaultFormValues(exercise));
    const [checkboxValues, setcheckboxValues] = useState<CheckBoxValues>(getDefaultCheckboxValues(exercise));

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

    const RadioPortion = ({ portion }: { portion: RadioSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string | undefined>(formValues[portion.key]);
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                {portion.description && <div dangerouslySetInnerHTML={{ __html: translate(portion.description) }} />}
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
                            control={<Radio required={portion.required} />}
                            label={translate(value)}
                        />
                    ))}
                </RadioGroup>
            </>
        );
    };
    const TextPortion = ({ portion }: { portion: TextSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string>(formValues[portion.key] ?? '');
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                {portion.description && <div dangerouslySetInnerHTML={{ __html: translate(portion.description) }} />}
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
                    onChange={(event) => {
                        setLocalValue(event.target.value);
                        formValues[portion.key] = event.target.value;
                        setFormValues(formValues);
                    }}
                />
            </>
        );
    };
    const DropdownPortion = ({ portion }: { portion: DropdownSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string>(formValues[portion.key]);
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                {portion.description && <div dangerouslySetInnerHTML={{ __html: translate(portion.description) }} />}
                <Select
                    id={portion.key}
                    labelId={portion.key}
                    value={localValue}
                    required={portion.required}
                    fullWidth
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
            </>
        );
    };
    const CheckboxPortion = ({ portion }: { portion: CheckboxSpec }): JSX.Element => {
        type LocalState = { key: string; value: string; checked: boolean }[];
        const [localValue, setLocalValue] = useState<LocalState>(checkboxValues[portion.key]);
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                {portion.description && <div dangerouslySetInnerHTML={{ __html: translate(portion.description) }} />}
                <FormGroup id={portion.key} aria-labelledby={portion.key}>
                    {localValue.map(({ key, value, checked }) => (
                        <FormControlLabel
                            id={key}
                            key={key}
                            control={
                                <Checkbox
                                    checked={checked}
                                    onChange={(event) => {
                                        setLocalValue(
                                            localValue.map((item) =>
                                                item.key === key ? { ...item, checked: event.target.checked } : item,
                                            ),
                                        );

                                        checkboxValues[portion.key] = localValue.map((item) =>
                                            item.key === key ? { ...item, checked: event.target.checked } : item,
                                        );
                                        setcheckboxValues(checkboxValues);
                                    }}
                                    required={portion.required}
                                />
                            }
                            label={translate(value)}
                        />
                    ))}
                </FormGroup>
            </>
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
        // @ts-expect-error Mathjax
        if (typeof window?.MathJax !== 'undefined') {
            // @ts-expect-error Mathjax
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
            for (const { key, checked } of values) {
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
                        <FormControl sx={{ mb: 1, display: 'block' }} key={portion.key}>
                            <Portion portion={portion} />
                        </FormControl>
                    ),
                )}
                <Button type="submit">Submit</Button>
            </form>
        </Container>
    );
};
export default FormExercise;
