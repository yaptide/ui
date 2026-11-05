import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PartialPage } from '../../../services/usePartialResultsWatch';
import { JobTasksSummary } from '../../../types/ResponseTypes';
import { OnDemandPages, pageStatus } from './OnDemandPages';

function page(fields: Partial<PartialPage> = {}): PartialPage {
	return {
		estimator: 'Dose',
		file: 'z_dose',
		pageNumber: 2,
		name: 'XY map',
		dimensions: 2,
		requestedAt: null,
		mergedAt: null,
		primaries: null,
		...fields
	};
}

const summary = {
	requestedPrimaries: 1000,
	taskStates: { RUNNING: 3 }
} as unknown as JobTasksSummary;

test('a map is never merged, on its way, or merged at a time from so many primaries', () => {
	expect(pageStatus(page(), summary)).toBe('Not merged yet');
	expect(pageStatus(page({ requestedAt: '2026-11-05T12:00:00Z' }), summary)).toMatch(
		/^Requested at .*coming with the next partial results$/
	);
	const idle = { ...summary, taskStates: { RUNNING: 0 } } as unknown as JobTasksSummary;
	expect(pageStatus(page({ requestedAt: '2026-11-05T12:00:00Z' }), idle)).toMatch(
		/waiting for a running task$/
	);

	expect(pageStatus(page({ mergedAt: '2026-11-05T12:00:00Z', primaries: 250 }), summary)).toMatch(
		/^As of .*, 250 primaries \(25%\)$/
	);
});

test('the button asks for that page alone, and is off while the page is on its way', async () => {
	const requestPage = jest.fn(() => Promise.resolve());
	const state = {
		live: true,
		pages: [
			page({ mergedAt: '2026-11-05T12:00:00Z', primaries: 1 }),
			page({ file: 'other', estimator: 'Fluence' })
		]
	};

	const { rerender } = render(
		<OnDemandPages
			jobId='j'
			estimatorName='Dose'
			state={state}
			summary={summary}
			requestPage={requestPage}
		/>
	);

	expect(screen.getAllByRole('button')).toHaveLength(1);
	fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
	await waitFor(() => expect(requestPage).toHaveBeenCalledWith('j', 'z_dose', 2));

	const asked = { live: true, pages: [page({ requestedAt: '2026-11-05T12:01:00Z' })] };
	rerender(
		<OnDemandPages
			jobId='j'
			estimatorName='Dose'
			state={asked}
			summary={summary}
			requestPage={requestPage}
		/>
	);
	expect(screen.getByRole('button', { name: 'Get now' })).toBeDisabled();
});
