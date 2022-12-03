import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { LabelPropertyField, TextPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { ObjectSelectPropertyField } from '../fields/ObjectSelectPropertyField';
import { SimulationEnv } from '../../../../js/Editor.SimulationEnv';

export function SimulationConfiguration(props: { editor: Editor }) {
	const { editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		editor.simEnvManager,
		false,
		true
	);

	return (
		<PropertiesCategory category='Simulator'>
			<ObjectSelectPropertyField
				label='Simulation Environment'
				value={watchedObject.currentValue}
				onChange={({ uuid }) => {
					editor.execute(
						new SetValueCommand(editor, watchedObject.object, 'currentValue', uuid)
					);
				}}
				options={watchedObject.getPossibleValues()}
			/>
		</PropertiesCategory>
	);
}
