import { Object3D } from 'three';

import { PARTICLE_TYPES } from '../../../../../types/Particle';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isParticleFilter, ParticleFilter } from '../../../../Simulation/Scoring/ParticleFilter';
import { ParticleSelect } from '../../../Select/ParticleSelect';
import { PropertiesCategory } from './PropertiesCategory';

export function ParticleFilterConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		object as unknown as ParticleFilter
	);

	const visibleFlag = isParticleFilter(watchedObject);

	const setValueCommand = (value: any, key: string) => {
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));
	};

	return (
		<PropertiesCategory
			category='Particle Filter'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<ParticleSelect
						// Ignore the Heavy ions type
						particles={PARTICLE_TYPES.filter(p => p.id !== 25)}
						value={watchedObject.particleData.id}
						onChange={(_, v) =>
							setValueCommand(
								{
									...watchedObject.particleData,
									id: v,
									name: PARTICLE_TYPES.find(p => p.id === v)?.name
								},
								'particleData'
							)
						}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
