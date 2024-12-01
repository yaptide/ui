import { TableCell, TableRow } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import React, { Fragment, ReactNode, useMemo } from 'react';

import { currentJobStatusData, StatusState } from '../../../../types/ResponseTypes';

export const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };

export const row = (
	id: number,
	title: string,
	value: string | undefined | ReactNode,
	guard = true
) => (
	<Fragment key={id}>
		{guard && (
			<TableRow sx={tableRowStyle}>
				<TableCell
					component='th'
					scope='row'>
					{title}
				</TableCell>
				<TableCell align='right'>{value}</TableCell>
			</TableRow>
		)}
	</Fragment>
);

export const useRows = (simulationStatus: any) => {
	return useMemo(() => {
		const rows: JSX.Element[] = [];

		if (currentJobStatusData[StatusState.RUNNING](simulationStatus)) {
			rows.push(row(0, 'Message', simulationStatus.message, !!simulationStatus.message));
		}

		return rows;
	}, [simulationStatus]);
};
