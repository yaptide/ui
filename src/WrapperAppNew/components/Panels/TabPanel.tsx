import { Paper, useTheme } from '@mui/material';
import { BoxProps } from '@mui/system';
import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { NavDrawerContext } from '../NavPanel/NavDrawerContext';

interface TabPanelProps extends BoxProps {
	children?: ReactNode;
	forTabs?: string[];
	persistent?: boolean;
	persistentIfVisited?: boolean;
}

export function TabPanel(props: TabPanelProps) {
	const { children, sx, forTabs, persistent, persistentIfVisited } = props;
	const currentTab = useContext(NavDrawerContext);
	const [visited, setVisited] = useState(false);
	const theme = useTheme();

	const visible = forTabs === undefined || forTabs.indexOf(currentTab) > -1;

	useEffect(() => {
		setVisited(visited || visible); // when set to `true`, it always stays `true`
	}, [forTabs, currentTab]);

	return (
		<Paper
			sx={{
				...sx,
				display: 'flex',
				flexDirection: 'column',
				overflowY: 'auto',
				overflowX: 'hidden',
				borderStyle: 'solid',
				borderWidth: 1,
				borderColor: theme.palette.divider
			}}
			elevation={1}
			role='tabpanel'
			style={{ display: visible ? '' : 'none' }}>
			{(visible || persistent || (visited && persistentIfVisited)) && children}
		</Paper>
	);
}
