import { ObjectManagementFactory } from '../../commands/factories/ObjectManagementFactory';
import { SimulationElement } from '../../Simulation/Base/SimulationElement';
import { isSimulationZone } from '../../Simulation/Base/SimulationZone';
import { isDetector } from '../../Simulation/Detectors/Detector';
import { isBasicFigure } from '../../Simulation/Figures/BasicFigures';
import { isScoringFilter } from '../../Simulation/Scoring/ScoringFilter';
import { isOutput } from '../../Simulation/Scoring/ScoringOutput';
import { isScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { YaptideEditor } from '../YaptideEditor';

export const canBeDuplicated = (object: object) => {
	return 'duplicate' in object && 'notDuplicatable' in object
		? object.notDuplicatable !== true
		: true;
};

export const getDuplicateCommand = (editor: YaptideEditor, object: SimulationElement) => {
	const commandFactory = new ObjectManagementFactory(editor);

	const clone = object.duplicate();

	if (isBasicFigure(clone)) {
		return commandFactory.createDuplicateCommand('figure', clone, editor.figureManager);
	} else if (isSimulationZone(clone)) {
		return commandFactory.createDuplicateCommand('zone', clone, editor.zoneManager);
	} else if (isDetector(clone)) {
		return commandFactory.createDuplicateCommand('detector', clone, editor.detectorManager);
	} else if (isOutput(clone)) {
		return commandFactory.createDuplicateCommand('output', clone, editor.scoringManager);
	} else if (isScoringQuantity(clone) && object.parent) {
		const output = object.parent.parent;

		if (isOutput(output))
			return commandFactory.createDuplicateCommand('quantity', clone, output);
	} else if (isScoringFilter(clone)) {
		return commandFactory.createDuplicateCommand('filter', clone, editor.scoringManager);
	}

	throw new Error('Command for duplication not implemented');
};
