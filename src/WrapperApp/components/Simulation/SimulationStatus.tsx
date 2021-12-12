import {
	Button,
	Card,
	CardActions,
	CardContent,
	Paper,
	SxProps,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Theme,
	Typography
} from '@mui/material';
import React from 'react';
import Countdown from 'react-countdown';
import { StatusState } from '../../../services/ShSimulationService';

interface SimulationStatusProps {
	simulation: SimulationStatusData;
}

export interface SimulationStatusData {
	uuid: string;
	status: StatusState;
	estimatedTime?: number;
	counted?: number;
	message?: string;
	result?: any;
}

export default function SimulationStatus({ simulation }: SimulationStatusProps) {
	const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };

	const row = (title: string, value: {} | undefined, guard = true) => (
		<React.Fragment key={title}>
			{guard && (
				<TableRow sx={tableRowStyle}>
					<TableCell component='th' scope='row'>
						{title}
					</TableCell>
					<TableCell align='right'>{value}</TableCell>
				</TableRow>
			)}
		</React.Fragment>
	);
	const rows = [
		row('UUID', simulation.uuid),
		row('State', simulation.status),
		row(
			'Estimated time',
			<Countdown date={simulation.estimatedTime} />,
			!!simulation.estimatedTime
		),
		row('Counted', simulation.counted, !!simulation.counted),
		row('Message', simulation.message, !!simulation.message)
	];

	const statusColor = (status: StatusState) => {
		switch (status) {
			case StatusState.FAILURE:
				return 'red';
			case StatusState.PROGRESS:
				return 'blue';
			case StatusState.SUCCESS:
				return 'green';
			default:
				return 'black';
		}
	};

	return (
		<Card sx={{ minWidth: 275 }}>
			<CardContent>
				<Typography
					gutterBottom
					variant='h5'
					component='div'
					color={statusColor(simulation.status)}>
					Simulation Status
				</Typography>
				<TableContainer component={Paper}>
					<Table aria-label='simple table'>
						<TableBody>{rows}</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
			<CardActions>
				<Button size='small'>Load Results</Button>
				<Button size='small' disabled>
					Cancel Simulation
				</Button>
			</CardActions>
		</Card>
	);
}
