import { StatusState } from '../types/ResponseTypes';
import { taskTotals } from './taskTotals';

describe('taskTotals', () => {
	it('reads the totals from the server summary', () => {
		expect(
			taskTotals({
				jobTasksSummary: {
					ntasks: 3,
					taskStates: {
						[StatusState.COMPLETED]: 1,
						[StatusState.FAILED]: 1,
						[StatusState.RUNNING]: 1
					},
					requestedPrimaries: 3000,
					simulatedPrimaries: 2400
				}
			})
		).toEqual({
			ntasks: 3,
			requestedPrimaries: 3000,
			simulatedPrimaries: 2400,
			finishedTasks: 2
		});
	});

	it('computes the same totals from a task list', () => {
		expect(
			taskTotals({
				jobTasksStatus: [
					{
						taskState: StatusState.COMPLETED,
						requestedPrimaries: 1000,
						simulatedPrimaries: 1000
					},
					{
						taskState: StatusState.FAILED,
						requestedPrimaries: 1000,
						simulatedPrimaries: 1000
					},
					{
						taskState: StatusState.RUNNING,
						requestedPrimaries: 1000,
						simulatedPrimaries: 400
					}
				]
			})
		).toEqual({
			ntasks: 3,
			requestedPrimaries: 3000,
			simulatedPrimaries: 2400,
			finishedTasks: 2
		});
	});

	it('has nothing to say without a summary or a list', () => {
		expect(taskTotals({})).toBeUndefined();
	});
});
