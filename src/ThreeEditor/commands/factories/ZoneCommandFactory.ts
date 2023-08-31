import { Editor } from '../../js/commands/AddObjectCommand';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationZone } from '../../Simulation/Base/SimulationZone';
import { ObjectManagementFactory } from './ObjectManagementFactory';

export class ZoneCommandFactory {
	managementFactory;
	editor: YaptideEditor;
	constructor(editor: Editor) {
		this.managementFactory = new ObjectManagementFactory(editor);
		this.editor = editor;
	}

	createAddZoneCommand = (zone: SimulationZone) =>
		this.managementFactory.createAddCommand('zone', zone, this.editor.zoneManager);

	createRemoveFigureCommand = (zone: SimulationZone) =>
		this.managementFactory.createRemoveCommand('zone', zone, this.editor.zoneManager);

	createDuplicateFigureCommand = (zone: SimulationZone) =>
		this.managementFactory.createDuplicateCommand('zone', zone, this.editor.zoneManager);

	createUpdateFigureCommand: ObjectManagementFactory['createUpdatePropertyCommand'] = (
		zone,
		property,
		newValue
	) => this.managementFactory.createUpdatePropertyCommand(zone, property, newValue);
}
