import {
	Box,
	Card,
	CardContent,
	Typography
} from '@mui/material';

import { useStore } from '../../../services/StoreService';
import EXAMPLES from '../../../ThreeEditor/examples/examples';
import SimulationStatus from './SimulationStatus';

interface SimulationPanelProps {
	goToResults?: () => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { setResultsSimulationData } = useStore();

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: 'min(960px, 100%)',
				padding: '2rem 5rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5rem',
				height: 'min-content'
			}}>
			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography gutterBottom variant='h5' component='div'>
						Demo Simulation Run List
					</Typography>
				</CardContent>
			</Card>

			{EXAMPLES.map(example => (
				<SimulationStatus
					key={example.result.uuid}
					simulation={example.result}
					loadResults={id => {
						console.log(id);
						if (id === null) props.goToResults?.call(null);
						else setResultsSimulationData(example.result);
					}}></SimulationStatus>
			))}
		</Box>
	);
}
