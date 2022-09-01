import { Box, Typography } from '@mui/material';
import React from 'react';
import { Page0D } from './GraphData';

export function JsRootGraph0D(props: { page: Page0D; title?: string }) {
	const { page, title } = props;

	return (
		<Box>
			<Typography variant='h4'>{title ?? 'Quantity'}</Typography>
			<Box
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start'
				}}>
				<p style={{ margin: '5px 10px' }}>{page.data.name}:</p>
				<p style={{ margin: '5px 10px' }}>{page.data.values[0]}</p>
				<p style={{ margin: '5px 10px' }}>[{page.data.unit}]</p>
			</Box>
		</Box>
	);
}

export default JsRootGraph0D;
