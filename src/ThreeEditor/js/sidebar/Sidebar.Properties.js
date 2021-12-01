import { UICustomTabbedPanel } from '../../util/UiUtils';
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
	container.selected = 'object';
	const info = new ObjectInfo(editor);
	const placement = new ObjectPlacement(editor);
	const dimensions = new ObjectDimensions(editor);
	const zoneRules = new ObjectCSG(editor);
	const grid = new ObjectGrid(editor);
	const calculate = new ObjectZoneCalculate(editor);
	const beam = new ObjectBeam(editor);
	const material = new ObjectMaterial(editor);

	let objectItems = [];
	let geometryItems = [];
	let materialItems = [];

	function refreshPanels(object) {
		[...objectItems, ...geometryItems, ...materialItems].forEach(item =>
			item.setObject(object)
		);
	}

	function setupPanels(object) {
		container.reset();
		objectItems = [];
		geometryItems = [];
		materialItems = [];
		let geometryName = 'GEOMETRY';
		if (object) {
			info.setObject(object);
			objectItems.push(info);
			if (!object.notMovable && !object.isScene /*TODO: Create custom scene for figures*/) {
				placement.setObject(object);
				objectItems.push(placement);
			}
			if (
				object.isScene ||
				object.isDetectContainer ||
				object.isZoneContainer ||
				object.isFilterContainer ||
				object.isOutputContainer
			) {
				//Containers don't have dimensions
			} else if (object.isZone) {
				zoneRules.setObject(object);
				geometryItems.push(zoneRules);
				geometryName = 'RULES';
			} else if (object.isBeam) {
				beam.setObject(object);
				geometryItems.push(beam);
				geometryName = 'DESCRIPTORS';
			} else if (!object.isFilter && !object.isOutput) {
				dimensions.setObject(object);
				geometryItems.push(dimensions);
				if (object.isDetectGeometry && ['Cyl', 'Mesh'].includes(object.detectType)) {
					grid.setObject(object);
					geometryItems.push(grid);
				} else if (object.isWorldZone && object.geometryType === 'Box') {
					calculate.setObject(object);
					geometryItems.push(calculate);
				}
			}
			if (
				object.isBasicMesh ||
				object.isDetectGeometry ||
				object.isZone ||
				object.isBeam ||
				object.isWorldZone
			) {
				material.setObject(object);
				materialItems.push(material);
			}
		}
		if (objectItems.length > 0) {
			container.addTab(
				'object',
				'OBJECT',
				objectItems.map(item => item.panel)
			);
		}
		if (geometryItems.length > 0) {
			container.addTab(
				'geometry',
				geometryName,
				geometryItems.map(item => item.panel)
			);
		}
		if (materialItems.length > 0) {
			container.addTab(
				'material',
				'MATERIAL',
				materialItems.map(item => item.panel)
			);
		}
		zoneRules.render();
		beam.render();
		material.render();
		container.select(container.selected);
	}

	signals.objectChanged.add(object => {
		if (object === editor.selected) refreshPanels(object);
	});

	signals.refreshSidebarObject3D.add(object => {
		if (object === editor.selected) setupPanels(object);
	});

	signals.objectSelected.add(setupPanels);
	signals.dataObjectSelected.add(setupPanels);
	signals.contextChanged.add(() => setupPanels(editor.selected));

	return container;
}

export { SidebarProperties };
