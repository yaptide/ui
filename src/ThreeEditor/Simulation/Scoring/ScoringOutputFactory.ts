import { SimulatorType } from '../../../types/RequestTypes';
import { YaptideEditor } from '../../js/YaptideEditor';
import { CommonScoringOutput } from './CommonScoringOutput';
import { GeantScoringOutput } from './GeantScoringOutput';

export default function createScoringOutput(editor: YaptideEditor) {
	return editor.contextManager.currentSimulator === SimulatorType.GEANT4
		? new GeantScoringOutput(editor)
		: new CommonScoringOutput(editor);
}
