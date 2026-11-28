import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { SCORING_TYPE_ENUM } from '../ThreeEditor/Simulation/Scoring/ScoringOutputTypes';
import { SimulatorType } from '../types/RequestTypes';
import { findEmptyProjectReason } from './findEmptyProjectReason';

const quantity = { name: 'Dose', keyword: 'Dose' };
const water = { uuid: 'water', icru: 276 };
const vacuum = { uuid: 'vacuum', icru: 1000 };
const blackHole = { uuid: 'black-hole', icru: 0 };
const completeOutput = { name: 'Out', quantities: [quantity], detectorUuid: 'detector' };
const zoneWithFigure = {
	uuid: 'zone',
	name: 'Zone',
	unionOperations: [[{ mode: 'union', objectUuid: 'figure' }]]
};
const boxWorld = { geometryType: 'BoxGeometry', parameters: { width: 10, height: 10, depth: 10 } };

type ProjectParts = {
	figures?: object[];
	zones?: object[];
	detectors?: object[];
	outputs?: object[];
	materials?: object[];
	world?: object;
};

const project = ({
	figures = [{ uuid: 'figure' }],
	zones = [zoneWithFigure],
	detectors = [{ uuid: 'detector' }],
	outputs = [completeOutput],
	materials = [vacuum, water],
	world = boxWorld
}: ProjectParts = {}) =>
	({
		figureManager: { figures },
		zoneManager: { zones, worldZone: { uuid: 'world', geometryData: world } },
		detectorManager: { detectors },
		materialManager: { materials },
		scoringManager: { outputs, filters: [] }
	}) as unknown as EditorJson;

const allSimulators = [SimulatorType.SHIELDHIT, SimulatorType.FLUKA, SimulatorType.GEANT4];
const zoneSimulators = [SimulatorType.SHIELDHIT, SimulatorType.FLUKA];

const reason = (editorJson: EditorJson, simulator = SimulatorType.SHIELDHIT) =>
	findEmptyProjectReason(editorJson, simulator);

test('reports an empty project before anything else', () => {
	const empty = project({
		figures: [],
		zones: [],
		detectors: [],
		outputs: [],
		materials: [vacuum],
		world: { geometryType: 'BoxGeometry', parameters: { width: 0, height: 0, depth: 0 } }
	});

	for (const simulator of allSimulators)
		expect(reason(empty, simulator)).toBe(
			'The project is empty: build the geometry in the Geometry tab and add an output with a quantity in the Scoring tab'
		);
});

test('blocks a zone without figures in simulators that use zones', () => {
	const emptyZone = project({ zones: [{ uuid: 'zone', name: 'Empty', unionOperations: [[]] }] });

	for (const simulator of zoneSimulators)
		expect(reason(emptyZone, simulator)).toBe(
			'Add a figure to zone "Empty" in its Zone Operations'
		);
	expect(reason(emptyZone, SimulatorType.GEANT4)).toBeUndefined();
});

test('blocks a World Zone without size in simulators that use it', () => {
	const flatBox = project({
		world: { geometryType: 'BoxGeometry', parameters: { width: 10, height: 0, depth: 10 } }
	});

	const flatCylinder = project({
		world: { geometryType: 'CylinderGeometry', parameters: { radius: 0, depth: 10 } }
	});

	for (const simulator of zoneSimulators) {
		expect(reason(flatBox, simulator)).toBe(
			'Set the World Zone size: enter its dimensions or use Calculate to fit it to the zones'
		);

		expect(reason(flatCylinder, simulator)).toBe(
			'Set the World Zone size: enter its dimensions or use Calculate to fit it to the zones'
		);
	}

	expect(reason(flatBox, SimulatorType.GEANT4)).toBeUndefined();
});

test('blocks SHIELD-HIT12A when the project has only vacuum and black hole', () => {
	const noMaterial = project({ materials: [vacuum, blackHole] });

	expect(reason(noMaterial, SimulatorType.SHIELDHIT)).toBe(
		'SHIELD-HIT12A needs a material other than vacuum: add a zone or change the World Zone material'
	);
	expect(reason(noMaterial, SimulatorType.FLUKA)).toBeUndefined();
	expect(reason(noMaterial, SimulatorType.GEANT4)).toBeUndefined();
});

test('reports geometry problems before scoring problems', () => {
	expect(reason(project({ zones: [], outputs: [], materials: [vacuum] }))).toBe(
		'SHIELD-HIT12A needs a material other than vacuum: add a zone or change the World Zone material'
	);
});

test('blocks a project without outputs', () => {
	for (const simulator of allSimulators)
		expect(reason(project({ outputs: [] }), simulator)).toBe(
			'Add an output with a quantity in the Scoring tab'
		);
});

test('blocks an output without quantities even when other outputs are complete', () => {
	const outputs = [completeOutput, { name: 'Empty', quantities: [], detectorUuid: 'detector' }];

	expect(reason(project({ outputs }))).toBe(
		'Add a quantity to output "Empty" or remove the output'
	);
});

test('blocks an output without a detector or with a removed detector', () => {
	expect(reason(project({ outputs: [{ name: 'Out', quantities: [quantity] }] }))).toBe(
		'Select a detector for output "Out"'
	);

	expect(reason(project({ outputs: [{ ...completeOutput, detectorUuid: 'removed' }] }))).toBe(
		'Select a detector for output "Out"'
	);
});

test('blocks a zone output without a zone, with a removed zone or with the World Zone', () => {
	const zoneOutput = { name: 'Out', quantities: [quantity], scoringType: SCORING_TYPE_ENUM.ZONE };

	for (const zoneUuid of [undefined, 'removed', 'world'])
		expect(reason(project({ outputs: [{ ...zoneOutput, zoneUuid }] }))).toBe(
			'Select a zone for output "Out"'
		);
});

test('allows a complete project in every simulator', () => {
	const outputs = [
		completeOutput,
		{
			name: 'Zone',
			quantities: [quantity],
			scoringType: SCORING_TYPE_ENUM.ZONE,
			zoneUuid: 'zone'
		},
		{ ...completeOutput, name: 'Explicit detector', scoringType: SCORING_TYPE_ENUM.DETECTOR }
	];

	for (const simulator of allSimulators)
		expect(reason(project({ outputs }), simulator)).toBeUndefined();
});

test('allows a project without zones when the World Zone has a material', () => {
	expect(reason(project({ figures: [], zones: [], materials: [water] }))).toBeUndefined();
});

test('asks for a zone before the World Zone size, because Calculate fits the World Zone to zones', () => {
	const onlyFigure = project({
		zones: [],
		detectors: [],
		outputs: [],
		materials: [vacuum],
		world: { geometryType: 'BoxGeometry', parameters: { width: 0, height: 0, depth: 0 } }
	});

	expect(reason(onlyFigure, SimulatorType.SHIELDHIT)).toBe(
		'SHIELD-HIT12A needs a material other than vacuum: add a zone or change the World Zone material'
	);

	expect(reason(onlyFigure, SimulatorType.FLUKA)).toBe(
		'Set the World Zone size: enter its dimensions or use Calculate to fit it to the zones'
	);

	expect(reason(onlyFigure, SimulatorType.GEANT4)).toBe(
		'Add an output with a quantity in the Scoring tab'
	);
});
