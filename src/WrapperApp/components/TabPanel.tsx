import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { Box } from '@mui/material';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value?: number;
	persistent?: boolean;
	persistentIfVisited?: boolean;
}

const tabPanelCss = css({ display: 'flex', flexGrow: 1, overflow: 'auto' });

export function TabPanel(props: TabPanelProps) {
	const { children, value, index, persistent, persistentIfVisited, ...other } = props;

	const [visited, setVisited] = useState(false);

	useEffect(() => {
		if (value === index) setVisited(true);
	}, [index, value]);

	return (
		<div
			role='tabpanel'
			className={tabPanelCss}
			style={{ display: value !== index ? 'none' : '' }}
			{...other}>
			{(value === index || persistent || (visited && persistentIfVisited)) && (
				<Box className={tabPanelCss}>{children}</Box>
			)}
		</div>
	);
}
