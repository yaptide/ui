import { Box, Chip, Divider, Grid, Paper, Typography } from '@mui/material';

import EXAMPLES, { useFetchExampleData } from '../../../examples/examples';
import { SimulatorType } from '../../../types/RequestTypes';

interface ExamplePanelProps {
	setTabsValue: (value: string) => void;
}

export function ExamplePanel({ setTabsValue }: ExamplePanelProps) {
	const fetchExampleData = useFetchExampleData();

	return (
		<Box sx={{ padding: 4 }}>
			{Object.values(SimulatorType).map(simulator => (
				<Box
					key={simulator}
					sx={{ marginBottom: 4, width: '500px' }}>
					<Typography variant='h5'>{simulator.toUpperCase()}</Typography>
					<Divider sx={{ marginTop: 1, marginBottom: 1 }} />
					<Box>
						{Object.entries(EXAMPLES[simulator]).map(([exampleName, fileName]) => (
							<Chip
								key={fileName}
								sx={{ fontSize: 12, margin: 0.5 }}
								label={exampleName}
								onClick={() => {
									fetchExampleData(fileName);
									// Change the tab to 'editor' after loading the example
									setTabsValue('editor');
								}}
							/>
						))}
					</Box>
				</Box>
			))}
		</Box>
	);
}
