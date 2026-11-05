import { Box, Button, Typography, useTheme } from '@mui/material';
import { useState } from 'react';

import { PartialPage, PartialState } from '../../../services/usePartialResultsWatch';
import { InfoTooltip } from '../../../shared/components/tooltip/InfoTooltip';
import { JobTasksSummary } from '../../../types/ResponseTypes';

function clock(iso: string): string {
	return new Date(iso).toLocaleTimeString();
}

/**
 * What a map of the partial results is now: never merged, asked for and on its way, or merged at a time from so many
 * primaries. A request made while no task runs waits for the next task to start.
 */
export function pageStatus(page: PartialPage, summary: JobTasksSummary | undefined): string {
	if (page.requestedAt) {
		const running = summary?.taskStates?.RUNNING ?? undefined;
		const waiting =
			running === 0
				? ', waiting for a running task'
				: ', coming with the next partial results';

		return `Requested at ${clock(page.requestedAt)}${waiting}`;
	}

	if (!page.mergedAt) return 'Not merged yet';
	const requested = summary?.requestedPrimaries;
	const primaries = page.primaries ?? 0;
	const share = requested ? ` (${Math.floor((100 * primaries) / requested)}%)` : '';

	return `As of ${clock(page.mergedAt)}, ${primaries.toLocaleString()} primaries${share}`;
}

/**
 * The maps (2D pages) of the estimator on screen while the simulation runs: each is merged only when asked for, that
 * page alone, and stays as it was until asked for again. When it was merged survives a reload: the server keeps it.
 */
export function OnDemandPages(props: {
	jobId: string;
	estimatorName: string | undefined;
	state: PartialState | undefined;
	summary: JobTasksSummary | undefined;
	requestPage: (jobId: string, file: string, pageNumber: number) => Promise<void>;
}) {
	const theme = useTheme();
	const { jobId, estimatorName, state, summary, requestPage } = props;
	const [sending, setSending] = useState<string | undefined>();
	const pages =
		state?.pages.filter(
			page => page.estimator === estimatorName || page.file === estimatorName
		) ?? [];

	if (!pages.length) return null;

	const ask = async (page: PartialPage) => {
		const key = `${page.file}|${page.pageNumber}`;
		setSending(key);

		try {
			await requestPage(jobId, page.file, page.pageNumber);
		} catch (error) {
			console.error('Failed to ask for the 2D page:', error);
		} finally {
			setSending(undefined);
		}
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: theme.spacing(0.5),
				marginBottom: theme.spacing(1)
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
				<Typography variant='subtitle2'>2D results</Typography>
				<InfoTooltip
					title={
						'0D and 1D results are merged live while the app is open. Each 2D page is merged only when you ' +
						'ask, that page alone, and stays as it was until you ask again. 3D results come only with the ' +
						'final results.'
					}
				/>
			</Box>
			{pages.map(page => {
				const key = `${page.file}|${page.pageNumber}`;

				return (
					<Box
						key={key}
						sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
						<Button
							size='small'
							variant='outlined'
							disabled={!!page.requestedAt || sending === key}
							onClick={() => ask(page)}>
							{page.mergedAt ? 'Refresh' : 'Get now'}
						</Button>
						<Typography variant='body2'>
							{page.name || `Page ${page.pageNumber}`}: {pageStatus(page, summary)}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
}
