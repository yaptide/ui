import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	LinearProgress,
	Typography
} from '@mui/material';
import { KyInstance } from 'ky';
import { useCallback, useEffect, useState } from 'react';

import { snakeToCamelCase } from '../../../util/Notation/Notation';

/** A task of a running simulation as the server lists it */
export type FinishableTask = {
	taskNumber: number;
	taskState?: string;
	requestedPrimaries?: number;
	simulatedPrimaries?: number;
	finishRequested?: boolean;
};

// the task list is read again this often while the dialog is open
export const TASKS_REFRESH_MS = 5000;
const ENDED = ['COMPLETED', 'FAILED', 'CANCELED'];

export function taskProgress(task: FinishableTask): number {
	if (!task.requestedPrimaries) return 0;

	return Math.min(100, (100 * (task.simulatedPrimaries ?? 0)) / task.requestedPrimaries);
}

/** Whether a task can still be finished early: not ended, and not asked already */
export function finishable(task: FinishableTask): boolean {
	return !ENDED.includes(task.taskState ?? '') && !task.finishRequested;
}

/**
 * The tasks of a running simulation, each of which the user may finish early (e.g. one on a slow node holding up
 * the results of all): it stops at its last save, which goes into the final results with its primaries. The
 * simulation then ends as usual, with fewer primaries than requested.
 */
export function FinishTasksDialog(props: {
	open: boolean;
	onClose: () => void;
	authKy: KyInstance;
	jobId: string;
}) {
	const { open, onClose, authKy, jobId } = props;
	const [tasks, setTasks] = useState<FinishableTask[] | undefined>();
	const [error, setError] = useState<string | undefined>();
	const [sending, setSending] = useState(false);

	const load = useCallback(async () => {
		try {
			const response = await authKy
				.get('jobs', { searchParams: { job_id: jobId, tasks: 'true' } })
				.json<{ jobTasksStatus?: unknown[] }>();

			// the client's JSON parser already turns the keys to camelCase
			const list = (response.jobTasksStatus ?? []).map(
				task => snakeToCamelCase(task as object, true) as unknown as FinishableTask
			);
			setTasks(list.sort((a, b) => a.taskNumber - b.taskNumber));
		} catch (err) {
			console.error('Failed to read the tasks:', err);
			setError('Could not read the tasks');
		}
	}, [authKy, jobId]);

	useEffect(() => {
		if (!open) return;
		load();
		const timer = setInterval(load, TASKS_REFRESH_MS);

		return () => clearInterval(timer);
	}, [open, load]);

	const finish = async (body: { task_numbers?: number[]; all?: boolean }) => {
		setSending(true);
		setError(undefined);

		try {
			await authKy.post('tasks/finish', { json: { job_id: jobId, ...body } });
			await load();
		} catch (err) {
			console.error('Failed to finish the tasks:', err);
			setError('Could not finish the tasks, try again');
		} finally {
			setSending(false);
		}
	};

	const anyFinishable = tasks?.some(finishable) ?? false;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth='sm'>
			<DialogTitle>Tasks</DialogTitle>
			<DialogContent>
				<Typography
					variant='body2'
					sx={{ mb: 2 }}>
					A task finished early stops at its last save, which goes into the results with
					the primaries it simulated by then. A task without a save yet adds nothing. The
					results come once every task has ended.
				</Typography>
				{!tasks && !error && <LinearProgress />}
				{error && <Typography color='error'>{error}</Typography>}
				{tasks?.length === 0 && !error && (
					<Typography variant='body2'>The server listed no tasks.</Typography>
				)}
				{tasks?.map(task => (
					<Box
						key={task.taskNumber}
						sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
						<Typography
							variant='body2'
							sx={{ width: 70 }}>
							Task {task.taskNumber}
						</Typography>
						<Box sx={{ flexGrow: 1 }}>
							<LinearProgress
								variant='determinate'
								value={taskProgress(task)}
							/>
						</Box>
						<Typography
							variant='body2'
							sx={{ width: 150 }}>
							{task.finishRequested && !ENDED.includes(task.taskState ?? '')
								? 'finishing…'
								: `${task.taskState ?? ''} ${(task.simulatedPrimaries ?? 0).toLocaleString()}`}
						</Typography>
						<Button
							size='small'
							variant='outlined'
							disabled={!finishable(task) || sending}
							onClick={() => finish({ task_numbers: [task.taskNumber] })}>
							Finish early
						</Button>
					</Box>
				))}
			</DialogContent>
			<DialogActions>
				<Button
					color='secondary'
					disabled={!anyFinishable || sending}
					onClick={() => finish({ all: true })}>
					Finish all now
				</Button>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
