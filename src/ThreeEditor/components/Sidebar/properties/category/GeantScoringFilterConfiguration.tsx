import { Typography } from '@mui/material';
import { Object3D } from 'three';

import { GEANT4_PARTICLE_TYPES } from '../../../../../types/Particle';
import { AutoCompleteSelect } from '../../../../../util/genericComponents/AutoCompleteSelect';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	GeantScoringFilter,
	isGeantScoringFilter
} from '../../../../Simulation/Scoring/GeantScoringFilter';
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
							<AutoCompleteSelect
								multiple={true}
								onChange={(_, value) => {
									setValueCommand(
										{ ...watchedObject.data, particleTypes: value },
										'data'
									);
								}}
								value={watchedObject.data?.particleTypes ?? []}
								renderValue={(particleTypes, _) =>
									particleTypes.map(t => (
										<Typography
											sx={{ px: '2px' }}>{`[${t.id}] ${t.name}`}</Typography>
									))
								}
								getOptionLabel={t => `[${t.id}] ${t.name}`}
								options={GEANT4_PARTICLE_TYPES}
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
