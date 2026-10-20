import { useTheme } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';

import { useRemoteWorkerSimulation } from '../../../../services/RemoteWorkerSimulationContextProvider';
import { ResultsSimulationDataWithSource } from '../../../../services/StoreService';
import { StyledTab, StyledTabs } from '../../../../shared/components/Tabs/StyledTabs';
import { SpecificEstimator } from '../../../../types/RequestTypes';
import { EstimatorPagesByDimensions } from '../../../../types/ResponseTypes';
import { FullSimulationData } from '../../../../types/SimulationService';
import { partialRevision } from '../../../../util/partialResults';

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
	const revision = partialRevision(simulation);
	// the partial results revision each tab was loaded at, so a newer partial or the final results load it again;
	// the estimators there at mount were loaded at the revision then (the component is keyed by simulation)
	const loadedRevisions = useRef(new Map<number, number | undefined>());
	const mountRevision = useRef(revision);

	const handleEstimatorTabChange = useCallback(
		async (id: number, isStale: () => boolean) => {
			const currentEstimatorData = simulation.estimators;
			const loadedRevision = loadedRevisions.current.has(id)
				? loadedRevisions.current.get(id)
				: mountRevision.current;

			const estimatorExists =
				currentEstimatorData[id] &&
				currentEstimatorData[id].name !== '' &&
				loadedRevision === revision;

			if (estimatorsPagesData) {
				const estimatorsPagesByDimensions = estimatorsPagesData[id].pagesByDimensions;

				if (!estimatorExists) {
					const simulationJobId = simulation.jobId;
					const allResults: SpecificEstimator[] = [];

					for (const [, pageDimension] of Object.entries(estimatorsPagesByDimensions)) {
						const estimatorData = await getEstimatorsPages(
							{
								jobId: simulationJobId,
								estimatorName: estimatorsTabData[id],
								pageNumbers: pageDimension.pageNums,
								revision
							},
							controller.signal,
							true
						);

						if (estimatorData) {
							allResults.push(estimatorData);
						}
					}

					// a newer simulation or tab is being loaded meanwhile
					if (allResults.length === 0 || isStale()) return;

					const aggregationResults = allResults.reduce(
						(acc, result) => {
							result.estimators.forEach(estimator => {
								const existingEstimator = acc.estimators.find(
									e => e.name === estimator.name
								);

								if (existingEstimator) {
									existingEstimator.pages.push(...estimator.pages);
									existingEstimator.fullResolutionName ??=
										estimator.fullResolutionName;
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
					loadedRevisions.current.set(id, revision);
					// not onSelect: a new partial loaded while another screen is open must not switch to Results
					setResultsSimulationData({ source: 'onLoad', data: newSimulation });
				}
			}
		},
		[
			controller.signal,
			estimatorsPagesData,
			estimatorsTabData,
			getEstimatorsPages,
			revision,
			setResultsSimulationData,
			simulation
		]
	);

	// the tab on screen, whenever it or the simulation changes
	useEffect(() => {
		let stale = false;
		handleEstimatorTabChange(tabsValue, () => stale);

		return () => {
			stale = true;
		};
	}, [handleEstimatorTabChange, tabsValue]);

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
					/>
				);
			})}
		</StyledTabs>
	);
};

export default EstimatorsSelect;
