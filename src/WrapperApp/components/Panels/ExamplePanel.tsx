import { Box, Grid, Paper, Typography } from '@mui/material';

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
					sx={{ marginBottom: 4 }}>
					{/* Simulator Name */}
					<Typography
						variant='h5'
						sx={{ marginBottom: 2 }}>
						{simulator.toUpperCase()}
					</Typography>

					{/* Grid of Examples */}
					<Grid
						container
						spacing={2}>
						{Object.entries(EXAMPLES[simulator]).map(([exampleName, fileName]) => (
							<Grid
								item
								xs={12}
								sm={6}
								md={4}
								key={fileName}>
								<Paper
									elevation={3}
									sx={{ padding: 2, textAlign: 'center', cursor: 'pointer' }}
									onClick={() => {
										fetchExampleData(fileName);
										// Change the tab to 'editor' after loading the example
										setTabsValue('editor');
									}}>
									<Typography variant='body1'>{exampleName}</Typography>
								</Paper>
							</Grid>
						))}
					</Grid>
				</Box>
			))}
		</Box>
	);
}
