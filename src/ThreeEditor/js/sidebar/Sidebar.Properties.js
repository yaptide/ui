import * as Panel from './object/Objects';
import { UICustomTabbedPanel, hideUIElement, showUIElement } from '../../../util/Ui/Uis';

function SidebarProperties(editor, id = 'properties') {
	const { signals } = editor;
	const container = new UICustomTabbedPanel();
	container.setId(id);
	const info = new Panel.ObjectInfo(editor);
	const placement = new Panel.ObjectPlacement(editor);
	const dimensions = new Panel.ObjectDimensions(editor);
	const zoneRules = new Panel.ObjectCSG(editor);
	const grid = new Panel.ObjectGrid(editor);
	const calculate = new Panel.ObjectZoneCalculate(editor);
	const beam = new Panel.ObjectBeam(editor);
	const material = new Panel.ObjectMaterial(editor);
	const filter = new Panel.ObjectFilter(editor);
	const settings = new Panel.ObjectSettings(editor);
	const quantity = new Panel.ObjectQuantity(editor);
	const differential = new Panel.ObjectDifferentials(editor);

	const generalItems = [info, placement, settings, quantity];
	const geometryItems = [dimensions, grid, calculate];
	const descriptorItems = [beam];
	const modifierItems = [zoneRules, filter, differential];
	const materialItems = [material];

	container.addTab(
		'general',
		'GENERAL',
		generalItems.map(item => item.panel)
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
		'modifiers',
		'MODIFIERS',
		modifierItems.map(item => item.panel)
	);
	container.addTab(
		'material',
		'MATERIAL',
		materialItems.map(item => item.panel)
	);
	container.select('general');

	function setupGeneralPanel(object) {
		info.setObject(object);
		if (!object.notMovable && !object.isScene)
			// TODO: Create custom scene for figures
			placement.setObject(object);
		else hideUIElement(placement.panel);
		if (!object.isOutput) hideUIElement(settings.panel);
		else settings.setObject(object);
		if (!object.isQuantity) hideUIElement(quantity.panel);
		else quantity.setObject(object);
	}

	const WITHOUT_GEOMETRIES = [
		'isScene',
		'isDetectContainer',
		'isZoneContainer',
		'isZone',
		'isFilterContainer',
		'isFilter',
		'isBeam',
		'isScoringManager',
		'isOutput',
		'isQuantity'
	];
	function setupGeometryPanel(object) {
		if (WITHOUT_GEOMETRIES.some(key => object[key])) return container.hideTab('geometry');
		container.showTab('geometry');
		switch (true) {
			case object.isDetector:
				[calculate].forEach(item => item.setObject(null));
				[grid, dimensions].forEach(item => item.setObject(object));
				break;
			case object.isWorldZone:
				[grid].forEach(item => item.setObject(null));
				[dimensions, calculate].forEach(item => item.setObject(object));
				break;
			case object.isBasicFigure:
				[grid, calculate].forEach(item => item.setObject(null));
				[dimensions].forEach(item => item.setObject(object));
				break;
			default:
				[dimensions, grid, calculate].forEach(item => item.setObject(null));
				break;
		}
	}

	const WITHOUT_DESCRIPTORS = [
		'isScene',
		'isBasicFigure',
		'isDetectContainer',
		'isScoringManager',
		'isDetector',
		'isZoneContainer',
		'isZone',
		'isWorldZone',
		'isFilterContainer',
		'isFilter',
		'isScoringManager',
		'isOutput',
		'isQuantity'
	];
	function setupDescriptorPanel(object) {
		if (WITHOUT_DESCRIPTORS.some(key => object[key])) return container.hideTab('descriptors');
		container.showTab('descriptors');
		[zoneRules, dimensions, grid, calculate].forEach(item => item.setObject(null));
		[beam].forEach(item => item.setObject(object));
	}

	const WITHOUT_MODIFIERS = [
		'isScene',
		'isBasicFigure',
		'isDetectContainer',
		'isDetector',
		'isZoneContainer',
		'isWorldZone',
		'isBeam',
		'isFilterContainer',
		'isScoringManager',
		'isOutput'
	];
	function setupModifierPanel(object) {
		if (WITHOUT_MODIFIERS.some(key => object[key])) return container.hideTab('modifiers');
		container.showTab('modifiers');
		switch (true) {
			case object.isZone:
				[beam, filter, differential].forEach(item => item.setObject(null));
				[zoneRules].forEach(item => item.setObject(object));
				break;
			case object.isFilter:
				[zoneRules, beam, differential].forEach(item => item.setObject(null));
				[filter].forEach(item => item.setObject(object));
				break;
			case object.isQuantity:
				[zoneRules, beam, filter].forEach(item => item.setObject(null));
				[differential].forEach(item => item.setObject(object));
				break;
			default:
				[zoneRules, beam, filter, differential].forEach(item => item.setObject(null));
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

		setupGeneralPanel(object);
		setupGeometryPanel(object);
		setupDescriptorPanel(object);
		setupModifierPanel(object);
		setupMaterialPanel(object);
	}

	signals.objectChanged.add(setupPanels);
	signals.objectSelected.add(setupPanels);

	setupPanels();

	return container;
}

export { SidebarProperties };
