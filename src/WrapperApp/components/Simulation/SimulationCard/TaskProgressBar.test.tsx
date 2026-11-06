import { render, screen } from '@testing-library/react';

import { barLayout, overallPercent, TaskProgressBar } from './TaskProgressBar';

test('many tasks wrap onto rows of at most 50 segments, spread evenly', () => {
	expect(barLayout(1)).toEqual({ rows: 1, columns: 1 });
	expect(barLayout(50)).toEqual({ rows: 1, columns: 50 });
	expect(barLayout(51)).toEqual({ rows: 2, columns: 26 });
	expect(barLayout(500)).toEqual({ rows: 10, columns: 50 });
});

test('a segment per task, filled as far as it got', () => {
	const progress = { permille: [1000, 250, 0], states: 'CRP' };
	render(<TaskProgressBar progress={progress} />);

	expect(screen.getAllByTestId('task-segment')).toHaveLength(3);
	expect(overallPercent(progress)).toBeCloseTo(41.67, 1);
	expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
});
