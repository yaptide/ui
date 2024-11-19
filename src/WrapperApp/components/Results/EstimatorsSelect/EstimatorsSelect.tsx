import { Card, CardContent, Tab, Tabs } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';

import { FullSimulationData, useShSimulation } from '../../../../services/ShSimulatorService';

interface EstimatorsTabProps {
	tabsValue: number;
	setTabsValue: (value: number) => void;
	simulation: FullSimulationData;
	setResultsSimulationData: React.Dispatch<React.SetStateAction<FullSimulationData | undefined>>;
	estimatorsTabData: string[];
	isFlukaExample: boolean;
}

const EstimatorsSelect = ({
	tabsValue,
	setTabsValue,
	simulation,
	setResultsSimulationData,
	estimatorsTabData,
	isFlukaExample
}: EstimatorsTabProps) => {
	const [controller] = useState(new AbortController());

	const { getJobResult } = useShSimulation();

	const handleEstimatorTabChange = useCallback(
		async (id: number) => {
			const currentEstimatorData = simulation.estimators;
			const estimatorExists =
				currentEstimatorData.some(estimator => estimator.name === estimatorsTabData[id]) ||
				isFlukaExample;

			console.log(estimatorsTabData);

			if (!estimatorExists) {
				const simulationJobId = simulation.jobId;

				const estimatorData = await getJobResult(
					{
						jobId: simulationJobId,
						estimatorName: estimatorsTabData[id] + '_'
					},
					controller.signal,
					true
				);

				const newEstimatorData = estimatorData?.estimators;

				if (newEstimatorData) {
					const newSimulation = {
						...simulation,
						estimators: [...currentEstimatorData, ...newEstimatorData]
					};
					setResultsSimulationData(newSimulation);
				}
			}
		},
		[
			controller.signal,
			estimatorsTabData,
			getJobResult,
			isFlukaExample,
			setResultsSimulationData,
			simulation
		]
	);

	useEffect(() => {
		handleEstimatorTabChange(0);
	}, [handleEstimatorTabChange]);

	const handleChange = (_event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	return (
		<Card
			sx={{
				margin: '0.5rem',
				height: 'min-content',
				overflow: 'unset',
				position: 'sticky',
				top: '8px',
				zIndex: 1
			}}>
			<CardContent
				sx={{
					color: theme =>
						theme.palette.mode === 'dark' ? 'secondary.contrastText' : 'secondary.dark'
				}}>
				<Tabs
					textColor='inherit'
					sx={{
						'flexShrink': 0,
						'& .MuiTabs-indicator': {
							backgroundColor: theme =>
								theme.palette.mode === 'dark'
									? 'secondary.contrastText'
									: 'secondary.dark'
						},
						'& .MuiButtonBase-root': {
							fontWeight: 'bold'
						}
					}}
					orientation='vertical'
					variant='scrollable'
					value={tabsValue}
					onChange={handleChange}>
					{estimatorsTabData.map((estimatorName, id) => {
						return (
							<Tab
								key={`tab_${estimatorName}`}
								label={estimatorName}
								value={id}
								onClick={() => handleEstimatorTabChange(id)}
							/>
						);
					})}
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default EstimatorsSelect;
