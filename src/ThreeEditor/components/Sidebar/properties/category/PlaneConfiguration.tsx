import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { YaptideEditor } from '../../../../js/YaptideEditor';
// import { isPlaneConfiguration } from
import Plane, { isPlane } from '../../../../Simulation/Base/Plane';
import { NumberPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export default function PlaneConfiguration(props: { editor: YaptideEditor; object: Plane }) {
	const { object, editor } = props;
	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		isPlane(object) ? object : null
	);

	const visibleFlag = isPlane(watchedObject);

	function handleChanged(event) {
		const num = event.target!.value;
	}

	return (
		<PropertiesCategory
			category='Plane value'
			visible={visibleFlag}>
			{watchedObject && (
				<NumberPropertyField
					label='Value'
					value={object.value}
					unit={editor.unit.name}
					min={0}
					onChange={v => {}}
				/>
			)}
		</PropertiesCategory>
	);
}
