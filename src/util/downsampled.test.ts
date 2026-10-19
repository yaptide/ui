import { downsampledLabel } from './downsampled';

describe('downsampledLabel', () => {
	it('names the shown and the full bins of the axes with more than one bin', () => {
		expect(downsampledLabel({ bins: [10000, 1, 10000], shown: [1000, 1, 1000] })).toBe(
			'Shown at 1000 × 1000 of 10000 × 10000 bins'
		);
	});

	it('says nothing for a page shown in full', () => {
		expect(downsampledLabel(undefined)).toBeUndefined();
	});
});
