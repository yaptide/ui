import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/system';
import { Table } from 'apache-arrow';
import { formatDate } from 'date-fns/format';
import { useEffect, useState } from 'react';

import { JsRootGraph2DArrow } from '../../../../JsRoot/components/JsRootGraph2DArrow';
import { JobPartialResults, RequestGetJobPartialResults } from '../../../../types/RequestTypes';
import { JobUnknownStatus, SimulationInfo } from '../../../../types/ResponseTypes';
import { SimulationProgress } from '../SimulationCard/SimulationCardContent';

interface PartialResultsContentProps {
	jobId?: string;
	jobStatus?: Omit<JobUnknownStatus & SimulationInfo, never>;
	getJobPartialResults?: (
		...args: RequestGetJobPartialResults
	) => Promise<JobPartialResults | undefined>;
}

export default function PartialResultsContent({
	jobId,
	jobStatus,
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
					{ jobId, estimatorName: 'yz_profile' },
					abortController.signal
				);
				setPartialResults(partialResults);
			} catch (error) {
				if ((error as Error).name === 'AbortError') return;
				// TODO: handle error properly, e.g. display a message to the user
				console.error('Error fetching partial results:', error);
			}
		};
		fetchPartialResults();
		const resultsFetchInterval = setInterval(fetchPartialResults, 5000);

		return () => {
			clearInterval(resultsFetchInterval);
			abortController.abort();
		};
	}, [getJobPartialResults]);

	const { startTime, endTime } = jobStatus ?? { startTime: new Date(), endTime: new Date() }; // TODO

	const startDate = new Date(startTime);
	const endDate = endTime ? new Date(endTime) : new Date();
	const duration = endDate ? endDate.valueOf() - startDate.valueOf() : 0;
	const formatDateTime = (date: Date) => formatDate(date, 'yyyy-MM-dd HH:mm:ss');

	const displayTable = partialResults?.estimatorsTable ?? new Table();

	return (
		<Box>
			{!partialResults ? (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%'
					}}>
					<CircularProgress />
				</Box>
			) : (
				<Stack sx={{}}>
					{jobStatus && (
						<SimulationProgress
							formatedStartDate={formatDateTime(startDate)}
							duration={duration}
							simulationStatus={jobStatus}
							textSx={{ fontSize: '1rem' }}
							barHeight={26}
						/>
					)}

					<JsRootGraph2DArrow
						title='XY Profile'
						table={displayTable}
					/>
				</Stack>
			)}
		</Box>
	);
}
