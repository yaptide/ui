import { MenuItem, Select } from '@mui/material';
import { Object3D } from 'three';

import { GEANT4_PARTICLE_TYPES } from '../../../../../types/Particle';
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
						<Select
							sx={{ width: '100%' }}
							size='small'
							onChange={event => {
								setValueCommand(event.target.value, 'filterType');
							}}
							variant='standard'
							value={watchedObject.filterType}>
							{filterTypeNames.map(name => (
								<MenuItem
									key={name}
									value={name}>
									{name}
								</MenuItem>
							))}
						</Select>
					</PropertyField>
					{(watchedObject.filterType === 'particle' ||
						watchedObject.filterType === 'particleWithKineticEnergy') && (
						<PropertyField label='Particles'>
							<Select
								variant={'standard'}
								sx={{ width: '100%' }}
								size='small'
								onChange={event => {
									const {
										target: { value }
									} = event;

									const particleTypes =
										typeof value === 'string' ? value.split(',') : value;

									const newData = { ...watchedObject.data, particleTypes };

									setValueCommand(newData, 'data');
								}}
								multiple
								value={watchedObject.data.particleTypes ?? []}>
								{GEANT4_PARTICLE_TYPES.map(({ id, name }) => (
									<MenuItem
										key={id}
										value={id}>
										{`[${id}] ${name}`}
									</MenuItem>
								))}
							</Select>
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
								<Select
									variant={'standard'}
									sx={{ width: '100%' }}
									size='small'
									value={watchedObject.data.kineticEnergyUnit}
									onChange={event =>
										setValueCommand(
											{
												...watchedObject.data,
												kineticEnergyUnit: event.target.value
											},
											'data'
										)
									}>
									{kineticEnergyUnits.map(unit => (
										<MenuItem
											key={unit}
											value={unit}>
											{unit}
										</MenuItem>
									))}
								</Select>
							</PropertyField>
						</>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
