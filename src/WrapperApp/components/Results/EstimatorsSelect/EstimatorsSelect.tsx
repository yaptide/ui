import { useTheme } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';

import {
	FullSimulationData,
	SpecificEstimator,
	useShSimulation
} from '../../../../services/ShSimulatorService';
import { StyledTab, StyledTabs } from '../../../../shared/components/Tabs/StyledTabs';
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
	const theme = useTheme();
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
		<StyledTabs
			sx={{ mx: theme.spacing(1), my: 0 }}
			value={tabsValue}
			onChange={handleChange}>
			{estimatorsTabData.map((estimatorName, id) => {
				return (
					<StyledTab
						sx={{ minHeight: 20 }}
						key={`tab_${estimatorName}`}
						label={estimatorName}
						value={id}
						onClick={() => handleEstimatorTabChange(id)}
					/>
				);
			})}
		</StyledTabs>
	);
};

export default EstimatorsSelect;
