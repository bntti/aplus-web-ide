import { Alert, AlertColor, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SubmissionStatus = 'hidden' | 'loading' | 'success' | 'rejected';
type Props = { status: SubmissionStatus; setStatus: (status: SubmissionStatus) => void };

const SubmissionSnackbar = ({ status, setStatus }: Props): JSX.Element => {
    const { t } = useTranslation();
    const [lastStatus, setLastStatus] = useState<SubmissionStatus>('loading');
    if (status !== lastStatus && status !== 'hidden') setLastStatus(status);

    const severityMap: { [key: string]: AlertColor } = { loading: 'info', success: 'success', rejected: 'error' };
    const textMap: { [key: string]: string } = {
        loading: t('loading'),
        success: t('submission-success'),
        rejected: t('submission-rejected!'),
    };

    return (
        <Snackbar open={status !== 'hidden'} autoHideDuration={3000} onClose={() => setStatus('hidden')}>
            <Alert onClose={() => setStatus('hidden')} severity={severityMap[lastStatus]} sx={{ width: '100%' }}>
                {textMap[lastStatus]}
            </Alert>
        </Snackbar>
    );
};

export default SubmissionSnackbar;
