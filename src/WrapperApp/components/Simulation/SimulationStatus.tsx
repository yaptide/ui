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
import { useState } from 'react';
import Countdown from 'react-countdown';

export default function SimulationStatus() {
	const tableRowStyle: SxProps<Theme> = { '&:last-child td, &:last-child th': { border: 0 } };

	const [completed, setCompleted] = useState(false);
	const [counted, setCounted] = useState(0);
	const [endTime, setEndTime] = useState(Date.now() + 10000);

	return (
		<Card sx={{ minWidth: 275 }}>
			<CardContent>
				<Typography gutterBottom variant='h5' component='div'>
					Simulation Status
				</Typography>
				<TableContainer component={Paper}>
					<Table aria-label='simple table'>
						<TableBody>
							<TableRow sx={tableRowStyle}>
								<TableCell component='th' scope='row'>
									State
								</TableCell>
								<TableCell align='right'>
									{completed ? 'Completed' : 'In progress'}
								</TableCell>
							</TableRow>
							<TableRow sx={tableRowStyle}>
								<TableCell component='th' scope='row'>
									Estimated time
								</TableCell>
								<TableCell align='right'>
									<Countdown
										date={endTime}
										onComplete={() => setCompleted(true)}
										onTick={delta => {
											setCounted(old => old + 1000);
											return delta;
										}}
									/>
								</TableCell>
							</TableRow>
							<TableRow sx={tableRowStyle}>
								<TableCell component='th' scope='row'>
									Counted
								</TableCell>
								<TableCell align='right'>{counted}</TableCell>
							</TableRow>
							<TableRow sx={tableRowStyle}>
								<TableCell component='th' scope='row'>
									UUID
								</TableCell>
								<TableCell align='right'></TableCell>
							</TableRow>
						</TableBody>
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
