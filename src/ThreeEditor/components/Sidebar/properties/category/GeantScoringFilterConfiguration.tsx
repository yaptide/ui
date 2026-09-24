import { Typography } from '@mui/material';
import { Object3D } from 'three';

import { getParticlesForSimulator } from '../../../../../types/ParticleCatalogue';
import { SimulatorType } from '../../../../../types/RequestTypes';
import { AutoCompleteSelect } from '../../../../../util/genericComponents/AutoCompleteSelect';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	GeantScoringFilter,
	isGeantScoringFilter
} from '../../../../Simulation/Scoring/GeantScoringFilter';
import { ParticleSelect } from '../../../Select/ParticleSelect';
import { NumberPropertyField, PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

const filterTypeNames = [
	'charged',
	'neutral',
	'particle',
	'kineticEnergy',
	'particleWithKineticEnergy'
];

const kineticEnergyUnits = ['meV', 'eV', 'keV', 'MeV', 'GeV'];

export function GeantScoringFilterConfiguration(props: {
	editor: YaptideEditor;
	object: Object3D;
}) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as GeantScoringFilter);

	const visibleFlag = isGeantScoringFilter(watchedObject);

	const setValueCommand = (value: any, key: string) => {
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));
	};

	return (
		<PropertiesCategory
			category='Filter Rules'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField label='Type'>
						<AutoCompleteSelect
							onChange={(_, value) => {
								setValueCommand(value, 'filterType');
							}}
							value={watchedObject.filterType}
							options={filterTypeNames}
						/>
					</PropertyField>
					{(watchedObject.filterType === 'particle' ||
						watchedObject.filterType === 'particleWithKineticEnergy') && (
						<PropertyField label='Particles'>
							<ParticleSelect
								multiple
								particles={getParticlesForSimulator(SimulatorType.GEANT4)}
								value={watchedObject.data?.particle_PDGs ?? []}
								onChange={(_, particle_PDGs) => {
									setValueCommand(
										{ ...watchedObject.data, particle_PDGs },
										'data'
									);
								}}
								renderValue={particles =>
									particles.map(p => (
										<Typography
											key={p.pdg}
											sx={{ px: '2px' }}>{`${p.displayName}`}</Typography>
									))
								}
							/>
						</PropertyField>
					)}
					{(watchedObject.filterType === 'kineticEnergy' ||
						watchedObject.filterType === 'particleWithKineticEnergy') && (
						<>
							<NumberPropertyField
								label='Low'
								unit={watchedObject.data.kineticEnergyUnit}
								value={watchedObject.data.kineticEnergyLow}
								onChange={v =>
									setValueCommand(
										{ ...watchedObject.data, kineticEnergyLow: v },
										'data'
									)
								}
							/>
							<NumberPropertyField
								label='High'
								unit={watchedObject.data.kineticEnergyUnit}
								value={watchedObject.data.kineticEnergyHigh}
								onChange={v =>
									setValueCommand(
										{ ...watchedObject.data, kineticEnergyHigh: v },
										'data'
									)
								}
							/>
							<PropertyField label='Unit'>
								<AutoCompleteSelect
									value={watchedObject.data.kineticEnergyUnit}
									onChange={(_, value) =>
										setValueCommand(
											{ ...watchedObject.data, kineticEnergyUnit: value },
											'data'
										)
									}
									options={kineticEnergyUnits}
								/>
							</PropertyField>
						</>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
