import { Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLoader } from '../../../services/DataLoaderService';
import { SimulationStatusData } from '../../../services/ShSimulatorService';

import { useStore } from '../../../services/StoreService';
import EXAMPLES from '../../../ThreeEditor/examples/examples';
import SimulationStatus from './SimulationStatus';

interface SimulationPanelProps {
	goToResults?: () => void;
}

export default function SimulationPanel(props: SimulationPanelProps) {
	const { setResultsSimulationData } = useStore();
	const [localSimulationData, setLocalSimulationData] =
		useState<SimulationStatusData[]>(EXAMPLES);

	const { resultsProvider, canLoadResultsData, setLoadedResults } = useLoader();

	useEffect(() => {
		if (canLoadResultsData) {
			setLoadedResults();
			setLocalSimulationData(resultsProvider);
		}
	}, [canLoadResultsData, resultsProvider, setLoadedResults]);

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

			{localSimulationData.map(example => (
				<SimulationStatus
					key={example.uuid}
					simulation={example}
					loadResults={id => {
						if (id === null) props.goToResults?.call(null);
						else setResultsSimulationData(example);
					}}></SimulationStatus>
			))}
		</Box>
	);
}
