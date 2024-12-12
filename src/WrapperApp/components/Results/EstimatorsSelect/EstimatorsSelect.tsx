import { Card, CardContent, Tab, Tabs } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';

import {
	FullSimulationData,
	SpecificEstimator,
	useShSimulation
} from '../../../../services/ShSimulatorService';
import { EstimatorPagesByDimensions } from '../../../../types/ResponseTypes';

interface EstimatorsTabProps {
	tabsValue: number;
	setTabsValue: (value: number) => void;
	simulation: FullSimulationData;
	setResultsSimulationData: React.Dispatch<React.SetStateAction<FullSimulationData | undefined>>;
	estimatorsTabData: string[];
	estimatorsPagesData: EstimatorPagesByDimensions[] | undefined;
}

const EstimatorsSelect = ({
	tabsValue,
	setTabsValue,
	simulation,
	setResultsSimulationData,
	estimatorsTabData,
	estimatorsPagesData
}: EstimatorsTabProps) => {
	const [controller] = useState(new AbortController());

	const { getEstimatorsPages } = useShSimulation();

	const handleEstimatorTabChange = useCallback(
		async (id: number) => {
			const currentEstimatorData = simulation.estimators;
			const estimatorExists =
				currentEstimatorData[id] && currentEstimatorData[id].name !== '';

			if (estimatorsPagesData) {
				const estimatorsPagesByDimensions = estimatorsPagesData[id].pagesByDimensions;

				if (!estimatorExists) {
					const simulationJobId = simulation.jobId;
					const allResults: SpecificEstimator[] = [];

					for (const [dimension, pageDimension] of Object.entries(
						estimatorsPagesByDimensions
					)) {
						console.log(pageDimension);
						const estimatorData = await getEstimatorsPages(
							{
								jobId: simulationJobId,
								estimatorName: estimatorsTabData[id],
								pageNumbers: pageDimension.pageNums
							},
							controller.signal,
							true
						);

						if (estimatorData) {
							allResults.push(estimatorData);
						}
					}

					if (allResults.length === 0) return;

					const aggregationResults = allResults.reduce(
						(acc, result) => {
							result.estimators.forEach(estimator => {
								const existingEstimator = acc.estimators.find(
									e => e.name === estimator.name
								);

								if (existingEstimator) {
									existingEstimator.pages.push(...estimator.pages);
								} else {
									acc.estimators.push(estimator);
								}
							});

							return acc;
						},
						{ jobId: simulationJobId, estimators: [], message: '' } as SpecificEstimator
					);

					const newEstimators = [...currentEstimatorData];

					while (newEstimators.length <= id) {
						newEstimators.push({
							name: '',
							pages: []
						});
					}

					newEstimators[id] = aggregationResults.estimators[0];

					const newSimulation = {
						...simulation,
						estimators: newEstimators
					};
					setResultsSimulationData(newSimulation);
				}
			}
		},
		[
			controller.signal,
			estimatorsPagesData,
			estimatorsTabData,
			getEstimatorsPages,
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
