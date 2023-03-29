import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { TextPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { isBeam } from '../../../../util/Beam';

export function ObjectInfo(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = !isBeam(watchedObject);

	return (
		<PropertiesCategory category='Information' visible={visibleFlag}>
			{visibleFlag && (
				<>
					<TextPropertyField
						label='Name'
						value={watchedObject.name}
						onChange={value => {
							editor.execute(
								new SetValueCommand(editor, watchedObject.object, 'name', value)
							);
						}}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
