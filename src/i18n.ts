import i18n from 'i18next'; // eslint-disable-line import/no-named-as-default
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n.use(LanguageDetector) // eslint-disable-line import/no-named-as-default-member
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        resources: {
            en: {
                translation: {
                    'not-logged-in': 'Not logged in',
                    'log-in': 'Log in',
                    'invalid-api-token': 'Invalid API token',
                    'my-courses': 'My Courses',
                    'loading-course': 'Loading course...',
                    'total-points': 'Total points',
                    passed: 'Passed',
                    'points-required-to-pass': 'Points required to pass',
                    'some-exercises-not-passed': 'Some exercises not passed',
                    points: 'Points',
                    exercise: 'Exercise',
                    submissions: 'Submissions',
                    'submissions-done': 'Submissions done',
                    'max-submissions': 'Max submissions',
                    'back-to-course': 'Back to course',
                    'loading-exercise': 'Loading exercise...',
                    'all-submissions-done': 'All {{count}} submissions done.',
                    'exercise-submission-type-info-unavailable': 'Exercise submission type info unavailable',
                    'submission-time': 'Submission time',
                    'submission-#': 'Submission #',
                    'show-templates': 'Show templates',
                    'submit-form': 'Submit',
                    'go-back': 'Go back',
                    'submission-rejected': 'Submission rejected',
                    'feedback:': 'Feedback:',
                    'loading-code': 'Loading code',
                    submission: 'Submission',
                    'waiting-for-grading': 'Waiting for grading...',
                    'no-exercise-info-available': 'Exercise info unavailable',
                    'file-submit': 'Submit',
                    language: 'Language',
                    feedback: 'Feedback',
                    code: 'Code',
                    'logout-confirm-unsaved': 'You might have unsaved changes, are you sure you want to log out?',
                    'log-out': 'Log out',
                    cancel: 'Cancel',
                    loading: 'Loading...',
                    'submission-loading': 'Submitting exercise...',
                    'submission-success': 'Submitted succesfully!',
                    'submission-rejected!': 'Submission rejected!',
                    'submission-failed-due-to': 'Submission failed due to the following reasons:',
                    'no-submissions': 'No submissions',
                    'loading-submission': 'Loading submission...',
                    profile: 'Profile',
                    save: 'Save',
                    'a+-preferences': 'A+ Preferences',
                    'student-id': 'Student ID',
                    email: 'Email',
                    username: 'Username',
                    organization: 'Organization',
                    'information-by-organization': 'Information provided by your organization',
                    'download-code': 'Download code',
                    'upload-code': 'Upload code',
                    'upload-file-filename': 'Upload',
                    'last-edited': 'Last edited',
                    'file-size': 'File size',
                    'file-type': 'File type',
                },
            },
            fi: {
                translation: {
                    'not-logged-in': 'Et ole kirjautunut sisään',
                    'log-in': 'Kirjaudu Sisään',
                    'invalid-api-token': 'Huono API token',
                    'my-courses': 'Kurssini',
                    'loading-course': 'Ladataan kurssia...',
                    'total-points': 'Pisteet yhteensä',
                    passed: 'Läpi',
                    'points-required-to-pass': 'Läpipääsyyn vaadittavat pisteet',
                    'some-exercises-not-passed': 'Osa tehtävistä ei läpi',
                    points: 'Pisteet',
                    exercise: 'Tehtävä',
                    submissions: 'Palautukset',
                    'submissions-done': 'Palautuksia tehty',
                    'max-submissions': 'Palautusten enimmäismäärä',
                    'back-to-course': 'Takaisin kurssille',
                    'loading-exercise': 'Ladataan tehtävää...',
                    'all-submissions-done': 'Kaikki {{count}} palautusta tehty.',
                    'exercise-submission-type-info-unavailable': 'Tehtävän palautustyyppi ei ole saatavilla',
                    'submission-time': 'Palautusaika',
                    'submission-#': 'Palautus #',
                    'show-templates': 'Näytä koodimallit',
                    'submit-form': 'Palauta',
                    'go-back': 'Takaisin',
                    'submission-rejected': 'Palautus hylätty',
                    'feedback:': 'Palaute:',
                    'loading-code': 'Ladataan koodia',
                    submission: 'Palautus',
                    'waiting-for-grading': 'Odoitetaan arviointia...',
                    'no-exercise-info-available': 'Tehtävän tiedot eivät ole saatavilla',
                    'file-submit': 'Palauta',
                    language: 'Kieli',
                    feedback: 'Palaute',
                    code: 'Koodi',
                    'logout-confirm-unsaved':
                        'Sinulla saattaa olla tallentamattomia muutoksia, oletko varma että haluat kirjautua ulos?',
                    'log-out': 'Kirjaudu ulos',
                    cancel: 'Peruuta',
                    loading: 'Ladataan...',
                    'submission-loading': 'Palautetaan tehtävää...',
                    'submission-success': 'Palautettiin onnistuneesti!',
                    'submission-rejected!': 'Palautus hylätty!',
                    'submission-failed-due-to': 'Palautus hylättiin seuraavista syistä:',
                    'no-submissions': 'Ei palautuksia',
                    'loading-submission': 'Ladataan palautusta...',
                    profile: 'Käyttäjätili',
                    save: 'Tallenna',
                    'a+-preferences': 'A+-Asetukset',
                    'student-id': 'Opiskelijanumero',
                    email: 'Sähköposti',
                    username: 'Käyttäjänimi',
                    organization: 'Organisaatio',
                    'information-by-organization': 'Organisaatioltasi saadut tiedot',
                    'download-code': 'Lataa koodi',
                    'upload-code': 'Lähetä koodi',
                    'upload-file-filename': 'Lähetä',
                    'last-edited': 'Viimmeisin muutos',
                    'file-size': 'Tiedostokoko',
                    'file-type': 'Tiedostotyyppi',
                },
            },
        },
    })
    .catch(console.error);

export default i18n;
