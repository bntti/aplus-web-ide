import { Box } from '@mui/material';

type TabPanelProps = {
    children?: React.ReactNode;
    index: number;
    value: number;
};

const TabPanel = (props: TabPanelProps): JSX.Element => {
    const { children, value, index } = props;

    return <div hidden={value !== index}>{value === index && <Box sx={{ p: 2 }}>{children}</Box>}</div>;
};

export default TabPanel;
