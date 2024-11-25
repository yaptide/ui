import { Box, Grid2, Paper, Typography } from '@mui/material';

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

					{/* Grid2 of Examples */}
					<Grid2
						container
						spacing={2}>
						{Object.entries(EXAMPLES[simulator]).map(([exampleName, fileName]) => (
							<Grid2
								key={fileName}
								sx={{ width: 200 }}>
								{' '}
								{/* Set a fixed width here */}
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
							</Grid2>
						))}
					</Grid2>
				</Box>
			))}
		</Box>
	);
}
