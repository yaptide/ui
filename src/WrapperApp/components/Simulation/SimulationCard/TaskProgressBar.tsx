import { Box, Tooltip, Typography, useTheme } from '@mui/material';

import { TaskProgress } from '../../../../types/ResponseTypes';

// segments per row at most: more tasks wrap onto more rows
export const SEGMENTS_PER_ROW = 50;
const STATE_NAMES: Record<string, string> = {
	P: 'pending',
	R: 'running',
	C: 'completed',
	F: 'failed',
	X: 'canceled',
	U: 'unknown'
};

/** The rows a bar of so many tasks takes, and the segments in each */
export function barLayout(ntasks: number): { rows: number; columns: number } {
	const rows = Math.max(1, Math.ceil(ntasks / SEGMENTS_PER_ROW));

	return { rows, columns: Math.max(1, Math.ceil(ntasks / rows)) };
}

/** The share of all primaries simulated, in percent, when every task requested as many */
export function overallPercent(progress: TaskProgress): number {
	if (!progress.permille.length) return 0;

	return progress.permille.reduce((sum, value) => sum + value, 0) / progress.permille.length / 10;
}

/**
 * The progress of every task, a segment each, as a torrent client shows the pieces of a download: filled as far as
 * the task got, coloured by its state. Many tasks wrap onto rows of at most SEGMENTS_PER_ROW, spread evenly.
 */
export function TaskProgressBar({ progress }: { progress: TaskProgress }) {
	const theme = useTheme();
	const { permille, states } = progress;
	const { rows, columns } = barLayout(permille.length);
	// thinner segments for more rows, so the card does not grow much
	const height = rows > 4 ? 6 : rows > 1 ? 8 : 18;

	const colour = (state: string) =>
		({
			C: theme.palette.success.main,
			R: theme.palette.primary.main,
			F: theme.palette.error.main,
			X: theme.palette.grey[500]
		})[state] ?? theme.palette.grey[400];

	return (
		<Box
			role='progressbar'
			aria-label='Progress of each task'
			aria-valuenow={Math.round(overallPercent(progress))}
			sx={{
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gap: '1px',
				mb: 1
			}}>
			{permille.map((value, index) => {
				const state = states[index] ?? 'U';

				return (
					<Tooltip
						key={index}
						title={`Task ${index + 1}: ${(value / 10).toFixed(1)}%, ${STATE_NAMES[state] ?? state}`}
						disableInteractive>
						<Box
							data-testid='task-segment'
							sx={{
								height,
								backgroundColor: theme.palette.action.hover,
								position: 'relative',
								overflow: 'hidden'
							}}>
							<Box
								sx={{
									position: 'absolute',
									inset: 0,
									width: `${value / 10}%`,
									backgroundColor: colour(state)
								}}
							/>
						</Box>
					</Tooltip>
				);
			})}
			{rows > 1 && (
				<Typography
					variant='caption'
					color='textDisabled'
					sx={{ gridColumn: '1 / -1' }}>
					{permille.length} tasks, {overallPercent(progress).toFixed(1)}%
				</Typography>
			)}
		</Box>
	);
}
