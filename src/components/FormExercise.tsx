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
    Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { CheckboxSpec, DropdownSpec, ExerciseWithInfo, FormSpec, RadioSpec, TextSpec } from '../routes/exerciseTypes';

type Props = { exercise: ExerciseWithInfo; apiToken: string; callback: () => void };
type FormCheckBoxValues = { [key: string]: { key: string; value: string; checked: boolean }[] };

const FormExercise = ({ exercise, apiToken, callback }: Props): JSX.Element => {
    const defaultFormValues: { [key: string]: string } = {};
    const defaultFormCheckboxValues: FormCheckBoxValues = {};
    for (const portion of exercise.exercise_info.form_spec) {
        if (portion.type === 'static') continue;
        if (portion.type === 'file') throw new Error('Tried to pass file type form to FormExercise');
        if (portion.type === 'checkbox') {
            defaultFormCheckboxValues[portion.key] = [];
            for (const [key, value] of Object.entries(portion.titleMap)) {
                defaultFormCheckboxValues[portion.key].push({ key, value, checked: false });
            }
        } else if (portion.type === 'dropdown' || portion.type === 'radio') {
            defaultFormValues[portion.key] = portion.enum[0];
        }
    }
    const [formValues, setFormValues] = useState<{ [key: string]: string }>(defaultFormValues);
    const [formCheckboxValues, setFormCheckboxValues] = useState<FormCheckBoxValues>(defaultFormCheckboxValues);

    const i18n = exercise.exercise_info.form_i18n;
    const translate = (value: string): string => {
        if (value in i18n && 'en' in i18n[value]) return i18n[value].en; // TODO: language
        return value;
    };

    const RadioPortion = ({ portion }: { portion: RadioSpec }): JSX.Element => {
        const [localValue, setLocalValue] = useState<string | undefined>(formValues[portion.key]);
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                <Typography>{translate(portion.description)}</Typography>
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
                <Typography>{translate(portion.description)}</Typography>
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
                <Typography>{translate(portion.description)}</Typography>
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
        const [localValue, setLocalValue] = useState<LocalState>(formCheckboxValues[portion.key]);
        return (
            <>
                <FormLabel id={portion.key}>{portion.title}</FormLabel>
                <Typography>{translate(portion.description)}</Typography>
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

                                        formCheckboxValues[portion.key] = localValue.map((item) =>
                                            item.key === key ? { ...item, checked: event.target.checked } : item,
                                        );
                                        setFormCheckboxValues(formCheckboxValues);
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

    const handleSubmit = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const formData = new FormData();
        for (const [portionKey, selectedValue] of Object.entries(formValues)) {
            formData.append(portionKey, selectedValue);
        }
        for (const [portionKey, values] of Object.entries(formCheckboxValues)) {
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

    return (
        <>
            <Container component={Paper} sx={{ pt: 1, pb: 1 }}>
                <form onSubmit={handleSubmit}>
                    {exercise.exercise_info.form_spec
                        .filter((portion): portion is FormSpec => portion.type !== 'static' && portion.type !== 'file')
                        .map((portion) => (
                            <FormControl sx={{ mb: 1, display: 'block' }} key={portion.key}>
                                <Portion portion={portion} />
                            </FormControl>
                        ))}
                    <Button type="submit">Submit</Button>
                </form>
            </Container>
        </>
    );
};
export default FormExercise;
