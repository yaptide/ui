import { MenuItem } from '@mui/material';
import { PopupState } from 'material-ui-popup-state/hooks';
import { Object3D } from 'three';

import { getRemoveCommand } from '../../../../util/hooks/useKeyboardEditorControls';
import { AddQuantityCommand } from '../../../js/commands/AddQuantityCommand';
import { getDuplicateCommand } from '../../../js/commands/DuplicateObjectCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { isSimulationElement, SimulationElement } from '../../../Simulation/Base/SimulationElement';
import { ScoringOutput } from '../../../Simulation/Scoring/ScoringOutput';

export type CommonContextActionProps = {
	object: Object3D | SimulationElement;
	editor: YaptideEditor;
	popupState: PopupState;
};

export type DuplicateActionProps = CommonContextActionProps;

export function DuplicateAction(props: DuplicateActionProps) {
	const { object, editor, popupState } = props;

	return (
		<MenuItem
			onClick={() => {
				if (!isSimulationElement(object)) return;
				const command = getDuplicateCommand(editor, object);
				editor.execute(command);
				popupState.close();
			}}>
			Duplicate
		</MenuItem>
	);
}

export type RenameActionProps = CommonContextActionProps & {
	setMode: (mode: 'view' | 'edit') => void;
};

export function RenameAction(props: RenameActionProps) {
	const { popupState, setMode } = props;

	return (
		<MenuItem
			onClick={() => {
				popupState.close();
				setMode('edit');
			}}>
			Rename
		</MenuItem>
	);
}

export type AddQuantityActionProps = CommonContextActionProps & {
	object: ScoringOutput;
	isOpen: boolean;
	onToggle: () => void;
};

export function AddQuantityAction(props: AddQuantityActionProps) {
	const { object, editor, popupState, isOpen, onToggle } = props;

	return (
		<MenuItem
			onClick={() => {
				editor.execute(new AddQuantityCommand(editor, object));

				if (!isOpen) onToggle();
				popupState.close();
			}}>
			Add Quantity
		</MenuItem>
	);
}

export type DeleteActionProps = CommonContextActionProps;

export function DeleteAction(props: DeleteActionProps) {
	const { object, editor, popupState } = props;

	return (
		<MenuItem
			onClick={() => {
				editor.execute(getRemoveCommand(editor, object));
				popupState.close();
			}}>
			Delete
		</MenuItem>
	);
}
