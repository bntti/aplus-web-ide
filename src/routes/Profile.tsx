import {
    Button,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Language, LanguageContext, UserContext } from '../app/StateProvider';

const Profile = (): JSX.Element => {
    const { t } = useTranslation();
    const { language, setLanguage } = useContext(LanguageContext);
    const { user } = useContext(UserContext);

    const [newLanguage, setNewLanguage] = useState<Language>(language);

    const handleSubmit = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        setLanguage(newLanguage);
    };

    if (user === null) throw new Error('Profile was called even though user is null');
    return (
        <Container component={Paper} sx={{ pt: 2.5, pb: 3 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                {user.full_name}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="h5" sx={{ mb: 2 }}>
                {t('a+-preferences')}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Stack direction="row" spacing={1}>
                    <FormControl>
                        <InputLabel id="language-select">{t('language')}</InputLabel>

                        <Select
                            sx={{ width: '200px' }}
                            size="small"
                            id="language-select"
                            label={t('language')}
                            value={newLanguage}
                            onChange={(event) => setNewLanguage(event.target.value as Language)}
                        >
                            <MenuItem value={'finnish'}>suomi</MenuItem>
                            <MenuItem value={'english'}>English</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" type="submit" sx={{ mt: 1 }}>
                        {t('save')}
                    </Button>
                </Stack>
            </form>
            <Divider sx={{ mt: 3, mb: 2 }} />

            <Typography variant="h5">{t('information-by-organization')}</Typography>
            <Table sx={{ width: '400px' }}>
                <TableBody>
                    <TableRow>
                        <TableCell>{t('student-id')}</TableCell>
                        <TableCell>{user.student_id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{t('email')}</TableCell>
                        <TableCell>{user.email}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ borderBottom: 'none' }}>{t('username')}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{user.username}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Container>
    );
};

export default Profile;
