import { EditorJson } from '../../js/EditorJson';
import { findScoringProblems } from './scoringProblems';

const DETECTOR = 'detector-uuid';
const ZONE = 'zone-uuid';
const WORLD = 'world-zone-uuid';
const FILTER = 'filter-uuid';

function editorJson(outputs: object[]): EditorJson {
	return {
		detectorManager: { detectors: [{ uuid: DETECTOR }] },
		zoneManager: { worldZone: { uuid: WORLD }, zones: [{ uuid: ZONE }] },
		scoringManager: { filters: [{ uuid: FILTER }], outputs }
	} as unknown as EditorJson;
}

function output(fields: object, quantities: object[] = []) {
	return { name: 'out', quantities, ...fields };
}

describe('findScoringProblems', () => {
	test('accepts outputs and quantities whose references exist', () => {
		expect(
			findScoringProblems(
				editorJson([
					output({ detectorUuid: DETECTOR }, [
						{ name: 'q1' },
						{ name: 'q2', filter: FILTER }
					]),
					output({ scoringType: 'ZONE', zoneUuid: ZONE }),
					output({ scoringType: 'ZONE', zoneUuid: WORLD }),
					output({ scoringType: 'DETECTOR', detectorUuid: DETECTOR })
				])
			)
		).toEqual([]);
	});

	test.each([
		['no detector', {}],
		['an undefined detector', { detectorUuid: undefined }],
		['a removed detector', { detectorUuid: 'removed' }],
		['a zone but detector scoring', { scoringType: 'DETECTOR', zoneUuid: ZONE }]
	])('reports a detector output with %s', (_, fields) => {
		expect(findScoringProblems(editorJson([output(fields)]))).toEqual([
			'Output "out" has no detector selected.'
		]);
	});

	test.each([
		['no zone', {}],
		['a removed zone', { zoneUuid: 'removed' }],
		['a detector but zone scoring', { detectorUuid: DETECTOR }]
	])('reports a zone output with %s', (_, fields) => {
		expect(
			findScoringProblems(editorJson([output({ scoringType: 'ZONE', ...fields })]))
		).toEqual(['Output "out" has no zone selected.']);
	});

	test.each([
		['an empty', ''],
		['a null', null],
		['a removed', 'removed']
	])('reports a quantity with %s filter', (_, filter) => {
		expect(
			findScoringProblems(
				editorJson([output({ detectorUuid: DETECTOR }, [{ name: 'q', filter }])])
			)
		).toEqual(['Quantity "q" in output "out" has Filter checked but no filter selected.']);
	});

	test('lists every problem in output order', () => {
		expect(
			findScoringProblems(
				editorJson([
					{ ...output({}, [{ name: 'a', filter: '' }]), name: 'first' },
					{
						...output({ detectorUuid: DETECTOR }, [{ name: 'b', filter: 'removed' }]),
						name: 'second'
					}
				])
			)
		).toEqual([
			'Output "first" has no detector selected.',
			'Quantity "a" in output "first" has Filter checked but no filter selected.',
			'Quantity "b" in output "second" has Filter checked but no filter selected.'
		]);
	});
});
