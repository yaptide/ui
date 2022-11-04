import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { LabelPropertyField, TextPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectInfo(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	return (
		<PropertiesCategory category='Information'>
			<LabelPropertyField label='ID' value={watchedObject.id.toString()} />
			<LabelPropertyField label='Type' value={watchedObject.type} />
			<TextPropertyField
				label='Name'
				value={watchedObject.name}
				onChange={value => {
					editor.execute(new SetValueCommand(editor, watchedObject.object, 'name', value));
				}}
			/>
		</PropertiesCategory>
	);
}
