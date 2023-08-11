import { ObjectManagementFactory } from '../../commands/factories/ObjectManagementFactory';
import { SimulationSceneChild } from '../../Simulation/Base/SimulationContainer';
import { SimulationElement } from '../../Simulation/Base/SimulationElement';
import { Detector, isDetector } from '../../Simulation/Detectors/Detector';
import { BasicFigure, isBasicFigure } from '../../Simulation/Figures/BasicFigures';
import { isScoringFilter, ScoringFilter } from '../../Simulation/Scoring/ScoringFilter';
import { isOutput, ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { isQuantity, ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command, CommandJSON } from '../Command';
import { YaptideEditor } from '../YaptideEditor';

interface DuplicateObjectCommandJSON extends CommandJSON {
	objectUuid: string;
	actionCommands: CommandJSON[];
}

export const canBeDuplicated = (object: unknown) => {
	return (
		isBasicFigure(object) ||
		isOutput(object) ||
		isQuantity(object) ||
		isScoringFilter(object) ||
		isDetector(object)
	);
};

export const getDuplicateCommand = (editor: YaptideEditor, object: SimulationElement) => {
	const commandFactory = new ObjectManagementFactory(editor);

	const clone = object.duplicate();

	if (isBasicFigure(clone)) {
		return commandFactory.createDuplicateCommand<'figure', BasicFigure, 'figures'>(
			'figure',
			clone,
			editor.figureManager
		);
		// } else if (isSimulationZone(clone)) {
		// 	return commandFactory.createDuplicateCommand('zone', clone, editor.zoneManager);
	} else if (isDetector(clone)) {
		return commandFactory.createDuplicateCommand<'detector', Detector, 'detectors'>(
			'detector',
			clone,
			editor.detectorManager
		);
	} else if (isOutput(clone)) {
		return commandFactory.createDuplicateCommand<'output', ScoringOutput, 'outputs'>(
			'output',
			clone,
			editor.scoringManager
		);
	} else if (isQuantity(clone) && object.parent && isOutput(object.parent.parent)) {
		return commandFactory.createDuplicateCommand<'quantity', ScoringQuantity, 'quantities'>(
			'quantity',
			clone,
			object.parent.parent
		);
	} else if (isScoringFilter(clone)) {
		return commandFactory.createDuplicateCommand<'filter', ScoringFilter, 'filters'>(
			'filter',
			clone,
			editor.scoringManager
		);
	}

	throw new Error('Object cannot be duplicated');
};

/**
 * @param editor YaptideEditor
 * @param object SimulationSceneChild
 * @constructor
 */
export class DuplicateObjectCommand extends Command {
	object: SimulationSceneChild;
	clonedObject: undefined | SimulationSceneChild;
	actionCommands: Command[] = [];
	constructor(editor: YaptideEditor, object: SimulationSceneChild) {
		super(editor);

		this.type = 'DuplicateObjectCommand';

		this.object = object;
		this.clonedObject = undefined;
	}

	execute() {
		this.clonedObject = this.object.clone();

		this.editor.addObject(this.clonedObject);
		this.editor.select(this.clonedObject);
	}

	undo() {
		if (!this.clonedObject) return;

		this.editor.removeObject(this.clonedObject);
		this.editor.select(this.object);
		this.clonedObject = undefined;
	}

	toJSON() {
		const output: DuplicateObjectCommandJSON = {
			...super.toJSON(),
			objectUuid: this.object.uuid,
			actionCommands: this.actionCommands.map(c => c.toJSON())
		};

		return output;
	}

	fromJSON(json: DuplicateObjectCommandJSON) {
		super.fromJSON(json);

		const found = this.editor.objectByUuid(json.objectUuid) as SimulationSceneChild;

		if (!found) throw new Error('The object was not found in the scene.');

		this.object = found;
	}
}
