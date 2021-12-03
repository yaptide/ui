import { UICustomTabbedPanel, hideUIElement, showUIElement } from '../../util/UiUtils';
import { ObjectBeam } from '../object/Object.Beam';
import { ObjectCSG } from '../object/Object.CSG';
import { ObjectDimensions } from '../object/Object.Dimensions';
import { ObjectGrid } from '../object/Object.Grid';
import { ObjectInfo } from '../object/Object.Info';
import { ObjectMaterial } from '../object/Object.Material';
import { ObjectPlacement } from '../object/Object.Placement';
import { ObjectZoneCalculate } from '../object/Object.ZoneCalculate';

function SidebarProperties(editor, id = 'properties') {
	const { signals } = editor;
	const container = new UICustomTabbedPanel();
	container.setId(id);
	const info = new ObjectInfo(editor);
	const placement = new ObjectPlacement(editor);
	const dimensions = new ObjectDimensions(editor);
	const zoneRules = new ObjectCSG(editor);
	const grid = new ObjectGrid(editor);
	const calculate = new ObjectZoneCalculate(editor);
	const beam = new ObjectBeam(editor);
	const material = new ObjectMaterial(editor);

	const objectItems = [info, placement];
	const geometryItems = [dimensions, grid, zoneRules, calculate, beam];
	const materialItems = [material];
	container.addTab(
		'object',
		'OBJECT',
		objectItems.map(item => item.panel)
	);
	container.addTab(
		'geometry',
		'GEOMETRY',
		geometryItems.map(item => item.panel)
	);
	container.addTab(
		'material',
		'MATERIAL',
		materialItems.map(item => item.panel)
	);
	container.select('object');

	function setupObjectPanel(object) {
		info.setObject(object);
		if (!object.notMovable && !object.isScene)
			// TODO: Create custom scene for figures
			placement.setObject(object);
		else hideUIElement(placement.panel);
	}

	function setupGeometryPanel(object) {
		if (
			object.isScene ||
			object.isDetectContainer ||
			object.isZoneContainer ||
			object.isFilterContainer ||
			object.isOutputContainer
		)
			return container.hideTab('geometry');
		container.showTab('geometry');
		switch (true) {
			case object.isZone:
				[beam, dimensions, grid, calculate].forEach(item => item.setObject(null));
				[zoneRules].forEach(item => item.setObject(object));
				container.changeTabName('geometry', 'RULES');
				break;
			case object.isBeam:
				[zoneRules, dimensions, grid, calculate].forEach(item => item.setObject(null));
				[beam].forEach(item => item.setObject(object));
				container.changeTabName('geometry', 'DESCRIPTORS');
				break;
			case object.isFilter:
				[zoneRules, beam, dimensions, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				container.changeTabName('geometry', 'RULES');
				break;
			case object.isOutput:
				[zoneRules, beam, dimensions, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				container.changeTabName('geometry', 'RULES');
				break;
			case object.isDetectGeometry:
				[zoneRules, beam, calculate].forEach(item => item.setObject(null));
				[grid, dimensions].forEach(item => item.setObject(object));
				container.changeTabName('geometry', 'GEOMETRY');
				break;
			case object.isWorldZone:
				[zoneRules, grid, beam].forEach(item => item.setObject(null));
				[dimensions, calculate].forEach(item => item.setObject(object));
				container.changeTabName('geometry', 'GEOMETRY');
				break;
			case object.isBasicMesh:
				[zoneRules, beam, grid, calculate].forEach(item => item.setObject(null));
				[dimensions].forEach(item => item.setObject(object));
				container.changeTabName('geometry', 'GEOMETRY');
				break;
			default:
				[zoneRules, beam, dimensions, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				console.warn(object);
				break;
		}
	}

	function setupMaterialPanel(object) {
		if (!object.material) return container.hideTab('material');
		container.showTab('material');
		material.setObject(object);
	}
	function setupPanels(object) {
		if (!object) return hideUIElement(container);
		showUIElement(container);

		setupObjectPanel(object);
		setupGeometryPanel(object);
		setupMaterialPanel(object);
	}

	signals.objectChanged.add(object => {
		if (object === editor.selected) setupPanels(object);
	});

	signals.objectSelected.add(object => {
		setupPanels(object);
	});
	signals.dataObjectSelected.add(object => {
		setupPanels(object);
	});

	setupPanels(editor.selected);

	return container;
}

export { SidebarProperties };
