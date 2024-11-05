import { Box,Grid, Paper, Typography } from '@mui/material';
import { useState } from 'react';

import EXAMPLES from '../../../examples/examples';
import { useLoader } from '../../../services/LoaderService';
import { FullSimulationData } from '../../../services/ShSimulatorService';
import { SimulatorType } from '../../../types/RequestTypes';
import { StatusState } from '../../../types/ResponseTypes';

interface ExamplePanelProps {
	setTabsValue: (value: string) => void;
}

export function ExamplePanel({ setTabsValue }: ExamplePanelProps) {
	// Call useLoader within the component to access its functions.
	const { loadFromJson } = useLoader();

	// Move fetchExampleData inside ExamplePanel so it can access loadFromJson.
	function fetchExampleData(exampleName: string) {
		fetch(`${process.env.PUBLIC_URL}/examples/${exampleName}`)
			.then(function (response) {
				if (response.status !== 200) {
					console.log('Looks like there was a problem. Status Code: ' + response.status);

					return;
				}

				response.json().then(function (data) {
					const simulationData: FullSimulationData = data as FullSimulationData;

					loadFromJson(
						[simulationData].map(e => {
							return {
								...e,
								jobState: StatusState.COMPLETED
							};
						})
					);

					// Change the tab to 'editor' after loading the example
					setTabsValue('editor');
				});
			})
			.catch(function (err) {
				console.log('Fetch Error :-S', err);
			});
	}

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
