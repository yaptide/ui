import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { TextPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectInfo(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = !isBeam(watchedObject);

	return (
		<PropertiesCategory
			category='Information'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<TextPropertyField
						label='Name'
						value={watchedObject.name}
						onChange={value => {
							editor.execute(
								new SetValueCommand(
									editor,
									watchedObject.object,
									'name',
									value.length > 0 ? value : watchedObject.type
								)
							);
						}}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
