import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { TextPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { isCTMesh } from '../../../../util/BasicMeshes';

export function CTConfiguration(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = isCTMesh(watchedObject);

	return (
		<PropertiesCategory category='CT Configuration' visible={visibleFlag}>
			{visibleFlag && (
				<>
					<TextPropertyField
						label='Path on server'
						value={watchedObject.pathOnServer}
						onChange={value => {
							editor.execute(
								new SetValueCommand(
									editor,
									watchedObject.object,
									'pathOnServer',
									value
								)
							);
						}}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
