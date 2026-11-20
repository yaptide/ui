import { useTheme } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';

import { useRemoteWorkerSimulation } from '../../../../services/RemoteWorkerSimulationContextProvider';
import { ResultsSimulationDataWithSource } from '../../../../services/StoreService';
import { StyledTab, StyledTabs } from '../../../../shared/components/Tabs/StyledTabs';
import { SpecificEstimator } from '../../../../types/RequestTypes';
import { EstimatorPagesByDimensions } from '../../../../types/ResponseTypes';
import { FullSimulationData } from '../../../../types/SimulationService';
import { eagerGroups, pageGroups } from '../../../../util/lazyPages';

interface EstimatorsTabProps {
	tabsValue: number;
	setTabsValue: (value: number) => void;
	simulation: FullSimulationData;
	setResultsSimulationData: React.Dispatch<
		React.SetStateAction<ResultsSimulationDataWithSource | undefined>
	>;
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

	const { getEstimatorsPages } = useRemoteWorkerSimulation();

	const handleEstimatorTabChange = useCallback(
		async (id: number) => {
			const currentEstimatorData = simulation.estimators;
			const estimatorExists =
				currentEstimatorData[id] && currentEstimatorData[id].name !== '';

			if (!estimatorsPagesData || estimatorExists) return;

			const simulationJobId = simulation.jobId;
			const estimatorName = estimatorsTabData[id];
			const estimatorPages =
				estimatorsPagesData.find(estimator => estimator.name === estimatorName) ??
				estimatorsPagesData[id];
			const allResults: SpecificEstimator[] = [];
			// only the values and lines: maps and volumes load when they come into view (EstimatorTab)
			const eager = eagerGroups(pageGroups(estimatorPages?.pagesByDimensions));

			for (const pageDimension of eager) {
				const estimatorData = await getEstimatorsPages(
					{
						jobId: simulationJobId,
						estimatorName,
						pageNumbers: pageDimension.pageNums
					},
					controller.signal,
					true
				);

				if (estimatorData) {
					allResults.push(estimatorData);
				}
			}

			// nothing came back: the tab stays empty, so selecting it again tries again
			if (eager.length > 0 && allResults.length === 0) return;

			const aggregationResults = allResults.reduce(
				(acc, result) => {
					result.estimators.forEach(estimator => {
						const existingEstimator = acc.estimators.find(
							e => e.name === estimator.name
						);

						if (existingEstimator) {
							existingEstimator.pages.push(...estimator.pages);
						} else {
							acc.estimators.push({ ...estimator, pages: [...estimator.pages] });
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

			// an estimator of maps only has none of its pages yet: they come when shown
			newEstimators[id] = aggregationResults.estimators[0] ?? {
				name: estimatorName,
				pages: []
			};

			const newSimulation = {
				...simulation,
				estimators: newEstimators
			};
			setResultsSimulationData({ source: 'onSelect', data: newSimulation });
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
