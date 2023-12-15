import { Object3D } from 'three';

import { PARTICLE_TYPES } from '../../../../../types/Particle';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isParticleFilter, ParticleFilter } from '../../../../Simulation/Scoring/ParticleFilter';
import { ParticleSelect } from '../../../Select/ParticleSelect';
import { PropertiesCategory } from './PropertiesCategory';

export function ParticleFilterConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ParticleFilter);

	const visibleFlag = isParticleFilter(watchedObject);

	return (
		<PropertiesCategory
			category='Particle Filter'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<ParticleSelect
						particles={PARTICLE_TYPES}
						value={watchedObject.getParticleType().id}
						onChange={(_, v) => console.log(v)}
					/>
				</>
			)}
		</PropertiesCategory>
	);
}
