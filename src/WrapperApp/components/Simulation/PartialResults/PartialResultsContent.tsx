import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';

import { Estimator, generateGraphs, isPage0d } from '../../../../JsRoot/GraphData';
import { JobPartialResults, RequestGetJobPartialResults } from '../../../../types/RequestTypes';
import { EstimatorResults } from '../../Results/ResultsPanel';

interface PartialResultsContentProps {
	jobId?: string;
	getJobPartialResults?: (
		...args: RequestGetJobPartialResults
	) => Promise<JobPartialResults | undefined>;
}

export default function PartialResultsContent({
	jobId,
	getJobPartialResults
}: PartialResultsContentProps) {
	const [partialResults, setPartialResults] = useState<JobPartialResults>();

	useEffect(() => {
		const abortController = new AbortController();

		// TODO: replace interval based fetch with SSE
		const fetchPartialResults = async () => {
			if (jobId === undefined || getJobPartialResults === undefined) return;

			try {
				const partialResults = await getJobPartialResults(
					{ jobId },
					abortController.signal
				);
				setPartialResults(partialResults);
				// TODO: remove after displaying the resutls in the UI
				console.log(partialResults);
			} catch (error) {
				if ((error as Error).name === 'AbortError') return;
				// TODO: handle error properly, e.g. display a message to the user
				console.error('Error fetching partial results:', error);
			}
		};

		const resultsFetchInterval = setInterval(fetchPartialResults, 3000);

		return () => {
			clearInterval(resultsFetchInterval);
			abortController.abort();
		};
	}, [getJobPartialResults]);

	const parseEstimators = (estimators: Estimator[]) => {
		const estimatorResults = estimators.map(estimator => {
			const tablePages = estimator.pages.filter(isPage0d);
			const gridPages = estimator.pages.filter(p => !isPage0d(p));
			const estimatorResults: EstimatorResults = { ...estimator, tablePages, gridPages };

			return estimatorResults;
		});

		return estimatorResults;
	};

	// TODO: handle multiple estimators
	const parsedEstimators = parseEstimators(partialResults?.estimators ?? [])?.[0];

	return (
		<Box>
			{!parsedEstimators ? (
				<CircularProgress />
			) : (
				generateGraphs(parsedEstimators, false, jobId)
			)}
		</Box>
	);
}
