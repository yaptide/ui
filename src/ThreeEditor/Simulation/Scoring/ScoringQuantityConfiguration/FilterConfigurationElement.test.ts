import { YaptideEditor } from '../../../js/YaptideEditor';
import { ScoringFilter } from '../ScoringFilter';
import FilterConfigurationElement from './FilterConfigurationElement';
import { ScoringQuantityConfigurator } from './ScoringQuantityConfigurator';

function setup(filterUuids: string[]) {
	const filters = filterUuids.map(uuid => ({ uuid }) as ScoringFilter);
	const editor = {
		scoringManager: {
			getFilterByUuid: (uuid: string) => filters.find(filter => filter.uuid === uuid) ?? null
		}
	} as unknown as YaptideEditor;

	return { filters, element: new FilterConfigurationElement(editor) };
}

const configurator = new ScoringQuantityConfigurator();

describe('FilterConfigurationElement', () => {
	test('saves the selected filter', () => {
		const { filters, element } = setup(['protons']);

		element.set(filters[0]);

		expect(element.applySerialize(configurator)).toEqual({ filter: 'protons' });
	});

	test('saves nothing when Filter is unchecked', () => {
		const { element } = setup(['protons']);

		expect(element.applySerialize(configurator)).toEqual({});
	});

	test('does not save the uuid of a removed filter but keeps Filter checked', () => {
		const { filters, element } = setup(['protons']);

		element.set(filters[0]);
		filters.pop();

		expect(element.get()).toBeNull();
		expect(element.isEnabled()).toBe(true);
		expect(element.applySerialize(configurator)).toEqual({ filter: '' });
	});

	test('finds the filter again when it comes back', () => {
		const { filters, element } = setup(['protons']);
		const [protons] = filters;

		element.set(protons);
		filters.pop();
		filters.push(protons);

		expect(element.get()).toBe(protons);
		expect(element.applySerialize(configurator)).toEqual({ filter: 'protons' });
	});

	test.each([
		['an existing filter', { filter: 'protons' }, true, 'protons'],
		['a removed filter', { filter: 'removed' }, true, null],
		['an empty filter', { filter: '' }, true, null],
		['no filter', {}, false, null]
	])('loads a quantity with %s', (_, json, enabled, uuid) => {
		const { element } = setup(['protons']);

		element.applyDeserialize(configurator, json);

		expect(element.isEnabled()).toBe(enabled);
		expect((element.get() as ScoringFilter | null)?.uuid ?? null).toBe(enabled ? uuid : null);
	});
});
