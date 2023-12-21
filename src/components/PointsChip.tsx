import { Chip, useTheme } from '@mui/material';

type PropsType = {
    points: number;
    maxPoints: number;
    gray?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium';
    sx?: object;
};
const PointsChip = ({ points, maxPoints, gray = false, ...props }: PropsType): JSX.Element => {
    const currentTheme = useTheme();

    let color: 'default' | 'error' | 'warning' | 'success';
    if (gray) color = 'default';
    else if (points === 0 && maxPoints > 0) color = 'error';
    else if (points < maxPoints) color = 'warning';
    else color = 'success';

    return (
        <Chip
            label={`${points} / ${maxPoints}`}
            color={color}
            variant={currentTheme.palette.mode === 'dark' ? 'filled' : 'outlined'}
            {...props}
        />
    );
};

export default PointsChip;
