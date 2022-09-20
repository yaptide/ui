import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { Box, Theme, useTheme } from '@mui/material';

interface TabPanelProps {
	children?: React.ReactNode;
	index: string | number;
	value?: string | number;
	persistent?: boolean;
	persistentIfVisited?: boolean;
}

const tabPanelCss = (theme: Theme) =>
	css({
		display: 'flex',
		flexGrow: 1,
		overflow: 'auto',
		background:
			theme.palette.mode == 'dark'
				? theme.palette.background.default
				: theme.palette.grey['50']
	});

export function TabPanel(props: TabPanelProps) {
	const { children, value, index, persistent, persistentIfVisited, ...other } = props;
	const theme = useTheme();
	const [visited, setVisited] = useState(false);

	useEffect(() => {
		if (value === index) setVisited(true);
	}, [index, value]);

	return (
		<div
			role='tabpanel'
			className={tabPanelCss(theme)}
			style={{ display: value !== index ? 'none' : '' }}
			{...other}>
			{(value === index || persistent || (visited && persistentIfVisited)) && (
				<Box className={tabPanelCss(theme)}>{children}</Box>
			)}
		</div>
	);
}
