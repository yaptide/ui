import { UICustomTabbedPanel, hideUIElement, showUIElement } from '../../util/Ui/Uis';
import { ObjectBeam } from './object/Object.Beam';
import { ObjectCSG } from './object/Object.CSG';
import { ObjectDimensions } from './object/Object.Dimensions';
import { ObjectGrid } from './object/Object.Grid';
import { ObjectInfo } from './object/Object.Info';
import { ObjectMaterial } from './object/Object.Material';
import { ObjectPlacement } from './object/Object.Placement';
import { ObjectZoneCalculate } from './object/Object.ZoneCalculate';
import { ObjectFilter } from './object/Object.Filter';

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
	const filter = new ObjectFilter(editor);

	const objectItems = [info, placement];
	const geometryItems = [dimensions, grid, calculate];
	const descriptorItems = [beam];
	const ruleItems = [zoneRules, filter];
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
		'descriptors',
		'DESCRIPTORS',
		descriptorItems.map(item => item.panel)
	);
	container.addTab(
		'rules',
		'RULES',
		ruleItems.map(item => item.panel)
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

	const WITHOUT_GEOMETRIES = [
		'isScene',
		'isDetectContainer',
		'isZoneContainer',
		'isZone',
		'isFilterContainer',
		'isFilter',
		'isBeam',
		'isOutput',
		'isOutputContainer'
	];
	function setupGeometryPanel(object) {
		if (WITHOUT_GEOMETRIES.some(key => object[key])) return container.hideTab('geometry');
		container.showTab('geometry');
		switch (true) {
			case object.isDetectGeometry:
				[zoneRules, beam, calculate].forEach(item => item.setObject(null));
				[grid, dimensions].forEach(item => item.setObject(object));
				break;
			case object.isWorldZone:
				[zoneRules, grid, beam].forEach(item => item.setObject(null));
				[dimensions, calculate].forEach(item => item.setObject(object));
				break;
			case object.isBasicMesh:
				[zoneRules, beam, grid, calculate].forEach(item => item.setObject(null));
				[dimensions].forEach(item => item.setObject(object));
				break;
			default:
				[zoneRules, beam, dimensions, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				break;
		}
	}

	const WITHOUT_DESCRIPTORS = [
		'isScene',
		'isBasicMesh',
		'isDetectContainer',
		'isDetectGeometry',
		'isZoneContainer',
		'isZone',
		'isWorldZone',
		'isFilterContainer',
		'isFilter',
		'isOutputContainer',
		'isOutput'
	];
	function setupDescriptorPanel(object) {
		if (WITHOUT_DESCRIPTORS.some(key => object[key])) return container.hideTab('descriptors');
		container.showTab('descriptors');
		[zoneRules, dimensions, grid, calculate].forEach(item => item.setObject(null));
		[beam].forEach(item => item.setObject(object));
	}

	const WITHOUT_RULES = [
		'isScene',
		'isBasicMesh',
		'isDetectContainer',
		'isDetectGeometry',
		'isZoneContainer',
		'isWorldZone',
		'isBeam',
		'isFilterContainer',
		'isOutputContainer',
		'isOutput'
	];
	function setupRulePanel(object) {
		if (WITHOUT_RULES.some(key => object[key])) return container.hideTab('rules');
		container.showTab('rules');
		switch (true) {
			case object.isZone:
				[beam, dimensions, filter, grid, calculate].forEach(item => item.setObject(null));
				[zoneRules].forEach(item => item.setObject(object));
				break;
			case object.isFilter:
				[zoneRules, beam, dimensions, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				[filter].forEach(item => item.setObject(object));
				break;
			default:
				[zoneRules, beam, dimensions, filter, grid, calculate].forEach(item =>
					item.setObject(null)
				);
				break;
		}
	}

	function setupMaterialPanel(object) {
		if (!object.material) return container.hideTab('material');
		container.showTab('material');
		material.setObject(object);
	}

	function setupPanels() {
		const { selected: object } = editor;
		if (!object) return hideUIElement(container);
		showUIElement(container);

		setupObjectPanel(object);
		setupGeometryPanel(object);
		setupDescriptorPanel(object);
		setupRulePanel(object);
		setupMaterialPanel(object);
	}

	signals.objectChanged.add(setupPanels);
	signals.objectSelected.add(setupPanels);
	signals.dataObjectSelected.add(setupPanels);

	setupPanels();

	return container;
}

export { SidebarProperties };
