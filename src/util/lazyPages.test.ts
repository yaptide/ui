import { eagerGroups, lazyGroups, pageGroups } from './lazyPages';

const pages = {
	'2': { names: ['Dose map'], pageNums: [3] },
	'0': { names: ['Dose'], pageNums: [0] },
	'1': { names: ['Depth dose', 'Fluence'], pageNums: [1, 2] },
	'3': { names: ['Volume'], pageNums: [4] }
};

describe('lazy pages', () => {
	it('loads values and lines with their estimator, maps and volumes when shown', () => {
		const groups = pageGroups(pages);

		expect(groups.map(group => group.dimension)).toEqual([0, 1, 2, 3]);
		expect(eagerGroups(groups).flatMap(group => group.pageNums)).toEqual([0, 1, 2]);
		expect(lazyGroups(groups).flatMap(group => group.pageNums)).toEqual([3, 4]);
	});

	it('has no groups for an estimator not known yet', () => {
		expect(pageGroups(undefined)).toEqual([]);
	});
});
