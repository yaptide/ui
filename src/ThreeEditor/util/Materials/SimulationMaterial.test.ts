import { Editor } from "../../js/Editor";
import { DEFAULT_MATERIAL_DENSITY, DEFAULT_MATERIAL_ICRU, DEFAULT_MATERIAL_NAME } from "./materials";
import SimulationMaterial from "./SimulationMaterial";

let editor: Editor;


beforeEach(async () => {
    editor = {} as Editor;
})

test('constructor default', () => {
    const material = new SimulationMaterial(editor)
    expect(material).toBeInstanceOf(SimulationMaterial);
    expect(material.icru).toBe(DEFAULT_MATERIAL_ICRU);
    expect(material.density).toBe(DEFAULT_MATERIAL_DENSITY);
    expect(material.name).toBe(DEFAULT_MATERIAL_NAME);
});

test('constructor params', () => {
    const material = new SimulationMaterial(editor, 'test', 1, 2)
    expect(material).toBeInstanceOf(SimulationMaterial);
    expect(material.icru).toBe(1);
    expect(material.density).toBe(2);
    expect(material.name).toBe('test');
});

test('toJSON', () => {
    const material = new SimulationMaterial(editor, 'test', 1, 2)
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
    })
    expect(material).toBeInstanceOf(SimulationMaterial);
    expect(material.icru).toBe(1);
    expect(material.density).toBe(2);
    expect(material.name).toBe('test');
    expect(material.uuid).toBe('testUuid');
});

test('clone', () => {
    const material = new SimulationMaterial(editor, 'test', 1, 2);
    const clone = material.clone()
    expect(clone).toBeInstanceOf(SimulationMaterial);
    expect(clone.icru).toBe(1);
    expect(clone.density).toBe(2);
    expect(clone.name).toBe('test');
    expect(clone.uuid).not.toBe(material.uuid);
});

test('copy', () => {
    const material = new SimulationMaterial(editor, 'test', 1, 2);
    const copy = new SimulationMaterial(editor);
    copy.copy(material);
    expect(copy).toBeInstanceOf(SimulationMaterial);
    expect(copy.icru).toBe(1);
    expect(copy.density).toBe(2);
    expect(copy.name).toBe('test');
    expect(copy.uuid).not.toBe(material.uuid);
});


