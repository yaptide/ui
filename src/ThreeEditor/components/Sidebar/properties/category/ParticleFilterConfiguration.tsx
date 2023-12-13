import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isParticleFilter,ParticleFilter } from '../../../../Simulation/Scoring/ParticleFilter';
import { SelectPropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ParticleFilterConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ParticleFilter);

	const visibleFlag = isParticleFilter(watchedObject);

	return (
		<PropertiesCategory
			category='Filter Rules'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<SelectPropertyField
						label='Particle type'
						value={watchedObject.particleType}
						onChange={value => {
							console.log(value);
						}}
						//editor.execute(
						//new SetFilterRuleCommand(editor, watchedObject.object, {
						//	uuid,
						//	keyword,
						//	operator,
						//	value
						//})
						//);
						//}}
						options={['example1', 'example2', 'etc']}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
