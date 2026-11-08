import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { KyInstance } from 'ky';

import { finishable, FinishTasksDialog, taskProgress } from './FinishTasksDialog';

const get = jest.fn();
const post = jest.fn();
const authKy = { get, post } as unknown as KyInstance;

// as the client's JSON parser gives it: keys in camelCase
function tasks(...list: object[]) {
	get.mockReturnValue({ json: () => Promise.resolve({ jobTasksStatus: list }) });
}

beforeEach(() => {
	get.mockReset();
	post.mockReset();
	post.mockResolvedValue({});
});

test('a task can be finished while it has not ended and was not asked already', () => {
	expect(finishable({ taskNumber: 1, taskState: 'RUNNING' })).toBe(true);
	expect(finishable({ taskNumber: 1, taskState: 'PENDING' })).toBe(true);
	expect(finishable({ taskNumber: 1, taskState: 'RUNNING', finishRequested: true })).toBe(false);
	expect(finishable({ taskNumber: 1, taskState: 'COMPLETED' })).toBe(false);
	expect(taskProgress({ taskNumber: 1, requestedPrimaries: 200, simulatedPrimaries: 50 })).toBe(
		25
	);
});

test('finishes one task, or all of them', async () => {
	tasks(
		{
			task_number: 2,
			task_state: 'RUNNING',
			requested_primaries: 100,
			simulated_primaries: 10
		},
		{
			task_number: 1,
			task_state: 'COMPLETED',
			requested_primaries: 100,
			simulated_primaries: 100
		}
	);

	render(
		<FinishTasksDialog
			open
			onClose={() => {}}
			authKy={authKy}
			jobId='job'
		/>
	);

	await screen.findByText('Task 2');
	const buttons = screen.getAllByRole('button', { name: 'Finish early' });
	// sorted by number: task 1 has ended
	expect(buttons[0]).toBeDisabled();
	fireEvent.click(buttons[1]);
	await waitFor(() =>
		expect(post).toHaveBeenCalledWith('tasks/finish', {
			json: { job_id: 'job', task_numbers: [2] }
		})
	);

	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Finish all now' })).toBeEnabled()
	);
	fireEvent.click(screen.getByRole('button', { name: 'Finish all now' }));
	await waitFor(() =>
		expect(post).toHaveBeenLastCalledWith('tasks/finish', {
			json: { job_id: 'job', all: true }
		})
	);
});

test('a task asked to finish shows it', async () => {
	tasks({ task_number: 1, task_state: 'RUNNING', finish_requested: true });
	render(
		<FinishTasksDialog
			open
			onClose={() => {}}
			authKy={authKy}
			jobId='job'
		/>
	);

	await screen.findByText('finishing…');
	expect(screen.getByRole('button', { name: 'Finish early' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Finish all now' })).toBeDisabled();
});
