import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';

import { JsRootGraph2DArrow } from '../../../../JsRoot/components/JsRootGraph2DArrow';
import { JobPartialResults, RequestGetJobPartialResults } from '../../../../types/RequestTypes';

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
				// TODO: remove after displaying the results in the UI
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

	return (
		<Box>
			{!partialResults ? (
				<CircularProgress />
			) : (
				<Box sx={{ width: '1080px', backgroundColor: 'white' }}>
					{/* TODO: Implement Arrow graphs for other estimators and use them here */}
					<JsRootGraph2DArrow
						title='TODO'
						table={partialResults.estimatorsTable}
					/>
				</Box>
			)}
		</Box>
	);
}
