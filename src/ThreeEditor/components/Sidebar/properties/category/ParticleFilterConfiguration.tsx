import { Object3D } from 'three';

import { getParticlesForSimulator } from '../../../../../types/ParticleCatalogue';
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

	const particlesForCurrentSimulator = getParticlesForSimulator(
		editor.contextManager.currentSimulator
	);

	return (
		<PropertiesCategory
			category='Particle Filter'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<ParticleSelect
						particles={particlesForCurrentSimulator}
						value={watchedObject.particleData.pdg}
						onChange={(_, v) =>
							setValueCommand(
								{
									...watchedObject.particleData,
									pdg: v,
									name: particlesForCurrentSimulator.find(p => p.pdg === v)
										?.displayName
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
