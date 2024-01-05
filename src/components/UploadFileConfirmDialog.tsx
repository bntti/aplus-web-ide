import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = { file: File | null; callback: () => void; open: boolean; handleClose: () => void };

const UploadFileConfirmDialog = ({ file, callback, open, handleClose }: Props): JSX.Element => {
    const { t } = useTranslation();

    if (file === null) return <></>;
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                {t('upload-file-filename')} <strong>{file.name}</strong>?
            </DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
                <DialogContentText>
                    {t('last-edited')}: {new Date(file.lastModified).toLocaleString()}
                </DialogContentText>
                <DialogContentText>
                    {t('file-type')}: {file.type}
                </DialogContentText>
                <DialogContentText>
                    {t('file-size')}: {file.size}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('cancel')}</Button>
                <Button
                    onClick={() => {
                        handleClose();
                        callback();
                    }}
                    autoFocus
                >
                    {t('upload-code')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UploadFileConfirmDialog;
