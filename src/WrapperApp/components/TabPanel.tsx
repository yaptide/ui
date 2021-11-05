import React from 'react';
import { css } from "@emotion/css";
import { Box } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    persistent?: boolean;
}

const tabPanelCss = css({ display: 'flex', flexGrow: 1, overflow: 'auto' });

export function TabPanel(props: TabPanelProps) {
    const { children, value, index, persistent, ...other } = props;

    return (
        <div
            role="tabpanel"
            className={tabPanelCss}
            style={{ display: value !== index ? 'none' : '' }}
            {...other}
        >
            {(value === index || persistent) && <Box className={tabPanelCss}>
                {children}
            </Box>}
        </div>
    );
}
