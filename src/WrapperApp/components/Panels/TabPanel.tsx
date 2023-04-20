import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { Box, Theme, useTheme } from '@mui/material';
import { BoxProps } from '@mui/system';

interface TabPanelProps extends BoxProps {
	children?: React.ReactNode;
	index: string | number;
	value?: string | number;
	persistent?: boolean;
	persistentIfVisited?: boolean;
	customCss?: React.CSSProperties;
}

const tabPanelCss = (theme: Theme, customCss?: React.CSSProperties) =>
	css({
		display: 'flex',
		flexGrow: 1,
		overflow: 'auto',
		background: theme.palette.background.default,
		...customCss
	});

export function TabPanel(props: TabPanelProps) {
	const { children, value, index, persistent, persistentIfVisited, customCss, ...other } = props;
	const theme = useTheme();
	const [visited, setVisited] = useState(false);

	useEffect(() => {
		if (value === index) setVisited(true);
	}, [index, value]);

	return (
		<Box
			role='tabpanel'
			className={tabPanelCss(theme, customCss)}
			style={{ display: value !== index ? 'none' : '' }}
			{...other}>
			{(value === index || persistent || (visited && persistentIfVisited)) && (
				<Box className={tabPanelCss(theme, customCss)}>{children}</Box>
			)}
		</Box>
	);
}
