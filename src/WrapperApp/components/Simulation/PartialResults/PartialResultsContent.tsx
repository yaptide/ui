import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Stack } from '@mui/system';
import { Table } from 'apache-arrow';
import { formatDate } from 'date-fns/format';
import { useEffect, useState } from 'react';

import { JsRootGraph2DArrow } from '../../../../JsRoot/components/JsRootGraph2DArrow';
import { Page2D } from '../../../../JsRoot/GraphData';
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

export function arrowTableToPages(table: Table): (Page2D | any)[] {
	const pages: any[] = [];

	// In Arrow, metadata is usually per-batch or per-schema.
	// If you wrote multiple batches to one stream, we iterate through them.
	for (const batch of table.batches) {
		const metadata = batch.schema.metadata;

		// 1. Extract and Parse the core metadata strings
		const estimatorName = metadata.get('estimator_name') || '';
		const dataName = metadata.get('data_name') || '';
		const dataUnit = metadata.get('data_unit') || '';
		const dimensions = parseInt(metadata.get('page_dimensions') || '0');

		// Parse JSON strings back into objects
		const axis1: any = JSON.parse(metadata.get('axis_dim1') || '{}');
		const axis2: any = JSON.parse(metadata.get('axis_dim2') || '{}');
		const pageMeta = JSON.parse(metadata.get('page_metadata') || '{}') as any;

		// 2. Extract the 'values' column data for this batch
		// .toArray() on a column within a batch gives you the TypedArray (Float64Array)
		const valuesArray = batch.getChildAt(0)?.toArray();
		const values: number[] = valuesArray ? Array.from(valuesArray) : [];

		// 3. Construct the Page2D object
		const page: Page2D = {
			name: dataName,
			dimensions: 2, // Explicitly casting for your interface
			data: {
				name: dataName,
				unit: dataUnit,
				values: values
			},
			axisDim1: {
				name: axis1.name || '',
				unit: axis1.unit || '',
				values: axis1.values || []
			},
			axisDim2: {
				name: axis2.name || '',
				unit: axis2.unit || '',
				values: axis2.values || []
			}
		};

		pages.push(page);
	}

	return pages;
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
