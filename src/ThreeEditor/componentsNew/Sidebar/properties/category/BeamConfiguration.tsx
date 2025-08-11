import { Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useEffect } from 'react';
import { Object3D } from 'three';

import {
	COMMON_PARTICLE_TYPES,
	FLUKA_PARTICLE_TYPES,
	GEANT4_PARTICLE_TYPES
} from '../../../../../types/Particle';
import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	Beam,
	BEAM_SOURCE_TYPE,
	isBeam,
	SAD_TYPE,
	SadType,
	SIGMA_TYPE,
	SigmaType
} from '../../../../Simulation/Physics/Beam';
import { ParticleSelect, ParticleType } from '../../../Select/ParticleSelect';
import {
	NumberPropertyField,
	PropertyField,
	SelectPropertyField,
	Vector2PropertyField
} from '../fields/PropertyField';
import { SourceFileDefinitionField } from '../fields/SourceFileField';
import { PropertiesCategory } from './PropertiesCategory';

function BeamSigmaField(props: { beam: Beam; onChange: (value: Beam['sigma']) => void }) {
	const configuration = {
		[SIGMA_TYPE.Gaussian]: {
			X: {
				text: 'sigma in X'
			},
			Y: {
				text: 'sigma in Y'
			}
		},
		[SIGMA_TYPE['Flat square']]: {
			X: {
				text: 'half-side in X'
			},
			Y: {
				text: 'half-side in Y'
			}
		},
		[SIGMA_TYPE['Flat circular']]: {
			Y: {
				text: 'radius'
			}
		}
	};

	const selectedConfiguration = configuration[props.beam.sigma.type];

	return (
		<>
			<SelectPropertyField
				label='Beam shape'
				value={props.beam.sigma.type}
				onChange={value =>
					props.onChange({ ...props.beam.sigma, type: value as SigmaType })
				}
				options={Object.keys(SIGMA_TYPE)}
			/>
			{'X' in selectedConfiguration && (
				<NumberPropertyField
					label={selectedConfiguration.X.text}
					value={props.beam.sigma.x}
					onChange={value => props.onChange({ ...props.beam.sigma, x: value })}
					min={0}
					unit='cm'
				/>
			)}
			<NumberPropertyField
				label={selectedConfiguration.Y.text}
				value={props.beam.sigma.y}
				onChange={value => props.onChange({ ...props.beam.sigma, y: value })}
				min={0}
				unit='cm'
			/>
		</>
	);
}

function BeamSadField(props: { beam: Beam; onChange: (value: Beam['sad']) => void }) {
	const configuration = {
		double: {
			X: {
				text: 'SAD X'
			},
			Y: {
				text: 'SAD Y'
			}
		},
		single: {
			X: {
				text: 'value'
			}
		},
		none: {}
	};

	const selectedConfiguration = configuration[props.beam.sad.type];
	const getOptionLabel = (option: string) => {
		return (
			Object.entries<string>(SAD_TYPE).find(entry => entry[0] === option)?.[1] ||
			SAD_TYPE.none
		);
	};

	return (
		<>
			<SelectPropertyField
				label='Sad planes'
				value={props.beam.sad.type}
				onChange={value => props.onChange({ ...props.beam.sad, type: value as SadType })}
				options={Object.keys(SAD_TYPE)}
				getOptionLabel={getOptionLabel}
			/>

			{(props.beam.sad.type === 'single' || props.beam.sad.type === 'double') && (
				<>
					{'X' in selectedConfiguration && (
						<NumberPropertyField
							label={selectedConfiguration.X.text}
							value={props.beam.sad.x}
							onChange={value => props.onChange({ ...props.beam.sad, x: value })}
							min={0}
							unit='cm'
						/>
					)}

					{'Y' in selectedConfiguration && (
						<NumberPropertyField
							label={selectedConfiguration.Y.text}
							value={props.beam.sad.y}
							onChange={value => props.onChange({ ...props.beam.sad, y: value })}
							min={0}
							unit='cm'
						/>
					)}
				</>
			)}
		</>
	);
}

function BeamConfigurationFields(props: { editor: YaptideEditor; object: Beam }) {
	const { object, editor } = props;

	let supportedParticles: ParticleType[] = [];

	switch (editor.contextManager.currentSimulator) {
		case SimulatorType.GEANT4:
			supportedParticles.push(...GEANT4_PARTICLE_TYPES);

			break;
		case SimulatorType.FLUKA:
			supportedParticles.push(...COMMON_PARTICLE_TYPES, ...FLUKA_PARTICLE_TYPES);

			break;
		default:
			supportedParticles.push(...COMMON_PARTICLE_TYPES);
	}

	const { state: watchedObject } = useSmartWatchEditorState(editor, object, true);

	const setValueCommand = (value: any, key: string) => {
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));
	};

	useEffect(() => {
		if (editor.contextManager.currentSimulator !== SimulatorType.SHIELDHIT) {
			setValueCommand(BEAM_SOURCE_TYPE.simple, 'sourceType');
		}
	}, [editor.contextManager.currentSimulator]);

	return (
		<>
			{editor.contextManager.currentSimulator !== SimulatorType.GEANT4 && (
				<PropertyField label='Definition type'>
					<ToggleButtonGroup
						color='primary'
						size='small'
						value={watchedObject.sourceType}
						exclusive
						onChange={(_, v) => {
							if (v) setValueCommand(v, 'sourceType');
						}}>
						<ToggleButton value={BEAM_SOURCE_TYPE.simple}>Simple</ToggleButton>
						{editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
							<ToggleButton value={BEAM_SOURCE_TYPE.file}>File</ToggleButton>
						)}
					</ToggleButtonGroup>
				</PropertyField>
			)}

			{watchedObject.sourceType === BEAM_SOURCE_TYPE.simple && (
				<>
					<NumberPropertyField
						label='Energy mean'
						min={1e-12}
						unit={'MeV/nucl'}
						value={watchedObject.energy}
						onChange={v => setValueCommand(v, 'energy')}
					/>
					<NumberPropertyField
						label='Energy spread'
						unit={watchedObject.energySpread < 0 ? 'Mev/c' : 'MeV/nucl'}
						value={watchedObject.energySpread}
						onChange={v => setValueCommand(v, 'energySpread')}
					/>
					{(editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT ||
						editor.contextManager.currentSimulator === SimulatorType.GEANT4) && (
						<>
							<NumberPropertyField
								label='Energy lower cutoff'
								unit={'MeV/nucl'}
								value={watchedObject.energyLowCutoff}
								onChange={v => setValueCommand(v, 'energyLowCutoff')}
							/>
							<NumberPropertyField
								label='Energy upper cutoff'
								unit={'MeV/nucl'}
								value={watchedObject.energyHighCutoff}
								onChange={v => setValueCommand(v, 'energyHighCutoff')}
							/>
						</>
					)}
					{editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
						<>
							<PropertyField children={<Divider />} />
							<Vector2PropertyField
								label='Divergence XY'
								value={watchedObject.divergence}
								unit={'mrad'}
								onChange={v =>
									setValueCommand(
										{ ...watchedObject.divergence, ...v },
										'divergence'
									)
								}
							/>
							<NumberPropertyField
								label='Divergence distance to focal point'
								unit={editor.unit.name}
								value={watchedObject.divergence.distanceToFocal}
								onChange={v =>
									setValueCommand(
										{ ...watchedObject.divergence, distanceToFocal: v },
										'divergence'
									)
								}
							/>
						</>
					)}
					<PropertyField children={<Divider />} />

					<BeamSigmaField
						beam={watchedObject}
						onChange={v => {
							setValueCommand(v, 'sigma');
						}}
					/>
				</>
			)}

			<PropertyField children={<Divider />} />
			<NumberPropertyField
				label='Number of primary particles'
				precision={0}
				step={1}
				value={watchedObject.numberOfParticles}
				onChange={v => setValueCommand(v, 'numberOfParticles')}
			/>
			<PropertyField label='Particle type'>
				<ParticleSelect
					particles={supportedParticles}
					value={watchedObject.particleData.id}
					onChange={(_, v) =>
						setValueCommand(
							{
								...watchedObject.particleData,
								id: v,
								name: supportedParticles.find(p => p.id === v)?.name
							},
							'particleData'
						)
					}
				/>
			</PropertyField>

			{watchedObject.particleData.id === 25 && (
				<>
					<NumberPropertyField
						label='charge (Z)'
						precision={0}
						step={1}
						value={watchedObject.particleData.z}
						onChange={v =>
							setValueCommand({ ...watchedObject.particleData, z: v }, 'particleData')
						}
					/>
					<NumberPropertyField
						label='nucleons (A)'
						precision={0}
						step={1}
						value={watchedObject.particleData.a}
						onChange={v =>
							setValueCommand({ ...watchedObject.particleData, a: v }, 'particleData')
						}
					/>
				</>
			)}

			{watchedObject.sourceType === BEAM_SOURCE_TYPE.file && (
				<>
					<BeamSadField
						beam={watchedObject}
						onChange={v => {
							setValueCommand(v, 'sad');
						}}
					/>

					<PropertyField children={<Divider />} />

					<SourceFileDefinitionField
						object={watchedObject}
						onChange={v => {
							setValueCommand(v, 'sourceFile');
						}}
					/>
				</>
			)}
		</>
	);
}

export function BeamConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const visibleFlag = isBeam(object);

	return (
		<PropertiesCategory
			category='Beam Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<BeamConfigurationFields
					editor={editor}
					object={object}
				/>
			)}
		</PropertiesCategory>
	);
}
