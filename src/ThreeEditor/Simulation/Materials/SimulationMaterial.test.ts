import { YaptideEditor } from '../../js/YaptideEditor.js';
import {
	DEFAULT_MATERIAL_DENSITY,
	DEFAULT_MATERIAL_ICRU,
	DEFAULT_MATERIAL_NAME
} from './materials';
import SimulationMaterial from './SimulationMaterial';

let editor: YaptideEditor;

beforeEach(async () => {
	editor = {} as YaptideEditor;
});

test('constructor default', () => {
	const material = new SimulationMaterial(editor);
	expect(material).toBeInstanceOf(SimulationMaterial);
	expect(material.icru).toBe(DEFAULT_MATERIAL_ICRU);
	expect(material.density).toBe(DEFAULT_MATERIAL_DENSITY);
	expect(material.name).toBe(DEFAULT_MATERIAL_NAME);
});

test('constructor params', () => {
	const material = new SimulationMaterial(editor, 'test', 1, 2);
	expect(material).toBeInstanceOf(SimulationMaterial);
	expect(material.icru).toBe(1);
	expect(material.density).toBe(2);
	expect(material.name).toBe('test');
});

test('toJSON', () => {
	const material = new SimulationMaterial(editor, 'test', 1, 2);
	expect(material.toJSON()).toEqual({
		uuid: material.uuid,
		name: 'test',
		icru: 1,
		density: 2
	});
});

test('fromJSON', () => {
	const material = SimulationMaterial.fromJSON(editor, {
		uuid: 'testUuid',
		name: 'test',
		icru: 1,
		density: 2
	});
	expect(material).toBeInstanceOf(SimulationMaterial);
	expect(material.icru).toBe(1);
	expect(material.density).toBe(2);
	expect(material.name).toBe('test');
	expect(material.uuid).toBe('testUuid');
	expect(material.customStoppingPower).toBe(false);

	const material2 = SimulationMaterial.fromJSON(editor, {
		uuid: 'testUuid',
		name: 'test',
		icru: 1,
		density: 2,
		customStoppingPower: true
	});

	expect(material2).toBeInstanceOf(SimulationMaterial);
	expect(material2.icru).toBe(1);
	expect(material2.density).toBe(2);
	expect(material2.name).toBe('test');
	expect(material2.uuid).toBe('testUuid');
	expect(material2.customStoppingPower).toBe(true);
});

test('clone', () => {
	const material = new SimulationMaterial(editor, 'test', 1, 2);
	material.customStoppingPower = true;
	const clone = material.clone();
	expect(clone).toBeInstanceOf(SimulationMaterial);
	expect(clone.icru).toBe(1);
	expect(clone.density).toBe(2);
	expect(clone.name).toBe('test');
	expect(clone.customStoppingPower).toBe(true);
	expect(clone.uuid).not.toBe(material.uuid);
});

test('copy', () => {
	const material = new SimulationMaterial(editor, 'test', 1, 2);
	material.customStoppingPower = true;
	const copy = new SimulationMaterial(editor);
	copy.copy(material);
	expect(copy).toBeInstanceOf(SimulationMaterial);
	expect(copy.icru).toBe(1);
	expect(copy.density).toBe(2);
	expect(copy.name).toBe('test');
	expect(copy.customStoppingPower).toBe(true);
	expect(copy.uuid).not.toBe(material.uuid);
});
