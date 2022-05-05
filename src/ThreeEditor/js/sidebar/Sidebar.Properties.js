import { UICustomTabbedPanel, hideUIElement, showUIElement } from '../../util/Ui/Uis';
import * as Panel from './object/Objects';

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
	const treatmentPlan = new Panel.ObjectTreatmentPlan(editor);

	const generalItems = [info, treatmentPlan, placement, settings, quantity];
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

	function setupPanel(name, panelItems, itemsToShow, object) {
		container.showTab(name);
		panelItems.forEach(item => item.setObject(null));
		itemsToShow.forEach(item => item.setObject(object));
		if (itemsToShow.length === 0) container.hideTab(name);
	}

	function setupGeneralPanel(object) {
		const itemsToShow = [info];

		if (!object.notMovable && !object.isScene)
			// TODO: Create custom scene for figures
			itemsToShow.push(placement);

		switch (true) {
			case object.isOutput:
				itemsToShow.push(settings);
				break;
			case object.isQuantity:
				itemsToShow.push(quantity);
				break;
			case object.isTreatmentPlan:
				itemsToShow.push(treatmentPlan);
				break;
			default:
		}
		setupPanel('general', generalItems, itemsToShow, object);
	}

	function setupGeometryPanel(object) {
		const itemsToShow = [dimensions];

		switch (true) {
			case object.isDetectGeometry:
				itemsToShow.push(grid);
				break;
			case object.isWorldZone:
				itemsToShow.push(calculate);
				break;
			case object.isBasicMesh:
			default:
		}
		setupPanel('geometry', geometryItems, itemsToShow, object);
	}

	function setupDescriptorPanel(object) {
		const itemsToShow = [];

		switch (true) {
			case object.isBeam:
				itemsToShow.push(beam);
				break;
			default:
		}
		setupPanel('descriptors', descriptorItems, itemsToShow, object);
	}

	function setupModifierPanel(object) {
		const itemsToShow = [];

		switch (true) {
			case object.isZone:
				itemsToShow.push(zoneRules);
				break;
			case object.isFilter:
				itemsToShow.push(filter);
				break;
			case object.isQuantity:
				itemsToShow.push(differential);
				break;
			default:
		}
		setupPanel('modifiers', modifierItems, itemsToShow, object);
	}

	function setupMaterialPanel(object) {
		setupPanel('material', materialItems, object.material ? [material] : [], object);
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
