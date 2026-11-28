import { JobTasksSummary, StatusState, TaskUnknownStatus } from '../types/ResponseTypes';

export type TaskTotals = {
	ntasks: number;
	requestedPrimaries: number;
	simulatedPrimaries: number;
	finishedTasks: number;
};

/**
 * Totals over the tasks of a simulation: from the server's summary, or from the task list
 * where only the list is known (simulations run in the browser).
 */
export function taskTotals(status: {
	jobTasksSummary?: JobTasksSummary;
	jobTasksStatus?: TaskUnknownStatus[];
}): TaskTotals | undefined {
	const summary = status.jobTasksSummary;

	if (summary) {
		const states = summary.taskStates;

		return {
			ntasks: summary.ntasks,
			requestedPrimaries: summary.requestedPrimaries,
			simulatedPrimaries: summary.simulatedPrimaries,
			finishedTasks: (states[StatusState.COMPLETED] ?? 0) + (states[StatusState.FAILED] ?? 0)
		};
	}

	return status.jobTasksStatus?.reduce<TaskTotals>(
		(totals, task) => ({
			ntasks: totals.ntasks + 1,
			requestedPrimaries: totals.requestedPrimaries + (task.requestedPrimaries ?? 0),
			simulatedPrimaries: totals.simulatedPrimaries + (task.simulatedPrimaries ?? 0),
			finishedTasks:
				totals.finishedTasks +
				(task.taskState === StatusState.COMPLETED || task.taskState === StatusState.FAILED
					? 1
					: 0)
		}),
		{ ntasks: 0, requestedPrimaries: 0, simulatedPrimaries: 0, finishedTasks: 0 }
	);
}
