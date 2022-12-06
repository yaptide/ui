import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Beam, BEAM_SOURCE_TYPE, isBeam, SigmaType, SIGMA_TYPE } from '../../../../util/Beam';
import {
	NumberPropertyField,
	PropertyField,
	SelectPropertyField,
	Vector2PropertyField
} from '../fields/PropertyField';
import { PARTICLE_TYPES } from '../../../../util/particles';
import { IParticleType, ParticleSelect } from '../../../Select/ParticlesSelect';
import { Box, Button, Divider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChangeEvent } from 'react';

function BeamDefinitionField(props: { beam: Beam }) {
	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) {
			return;
		}
		const file = e.target.files[0];

		const { name } = file;

		const reader = new FileReader();
		reader.onload = evt => {
			if (!evt?.target?.result) {
				return;
			}
			const { result } = evt.target;
			if (typeof result === 'string') {
				props.beam.beamSourceFile = { name, value: result };
			} else {
				console.error('Invalid file type');
			}
		};
		reader.readAsBinaryString(file);
	};

	const clearFile = () => {
		props.beam.beamSourceFile = { name: '', value: '' };
	};

	return (
		<>
			{props.beam.beamSourceFile.name && (
				<PropertyField label='Filename'>{props.beam.beamSourceFile.name}</PropertyField>
			)}

			<PropertyField>
				<Stack gap={1} direction='row'>
					<Button sx={{ flexGrow: 1 }} variant='contained' component='label'>
						Upload File
						<input type='file' hidden onChange={handleFileUpload} />
					</Button>

					<Button
						disabled={!props.beam.beamSourceFile.name}
						sx={{ flexGrow: 1 }}
						variant='contained'
						component='label'
						onClick={clearFile}
						color='warning'>
						Clear File
					</Button>
				</Stack>
			</PropertyField>
		</>
	);
}

function BeamSigmaField(props: { beam: Beam }) {
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
					(props.beam.sigma = { ...props.beam.sigma, type: value as SigmaType })
				}
				options={Object.keys(SIGMA_TYPE)}
			/>
			{'X' in selectedConfiguration && (
				<NumberPropertyField
					label={selectedConfiguration.X.text}
					value={props.beam.sigma.x}
					onChange={value => (props.beam.sigma = { ...props.beam.sigma, x: value })}
					min={0}
					unit='cm'
				/>
			)}
			<NumberPropertyField
				label={selectedConfiguration.Y.text}
				value={props.beam.sigma.y}
				onChange={value => (props.beam.sigma = { ...props.beam.sigma, y: value })}
				min={0}
				unit='cm'
			/>
		</>
	);
}

function BeamConfigurationFields(props: { editor: Editor; object: Beam }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object, true);

	return (
		<>
			<PropertyField label='Definition type'>
				<ToggleButtonGroup
					color='primary'
					size='small'
					value={watchedObject.beamSourceType}
					exclusive
					onChange={(_e, value) => {
						watchedObject.beamSourceType = value;
					}}>
					<ToggleButton value={BEAM_SOURCE_TYPE.simple}>Simple</ToggleButton>
					<ToggleButton value={BEAM_SOURCE_TYPE.file}>File</ToggleButton>
				</ToggleButtonGroup>
			</PropertyField>

			{watchedObject.beamSourceType === BEAM_SOURCE_TYPE.simple && (
				<>
					<NumberPropertyField
						label='Energy mean'
						min={1e-12}
						unit={'MeV/nucl'}
						value={watchedObject.energy}
						onChange={v => {
							watchedObject.energy = v;
						}}
					/>
					<NumberPropertyField
						label='Energy spread'
						unit={watchedObject.energySpread < 0 ? 'Mev/c' : 'MeV/nucl'}
						value={watchedObject.energySpread}
						onChange={v => {
							watchedObject.energySpread = v;
						}}
					/>
					<NumberPropertyField
						label='Energy lower cutoff'
						unit={'MeV/nucl'}
						value={watchedObject.energyLowCutoff}
						onChange={v => {
							watchedObject.energyLowCutoff = v;
						}}
					/>
					<NumberPropertyField
						label='Energy upper cutoff'
						unit={'MeV/nucl'}
						value={watchedObject.energyHighCutoff}
						onChange={v => {
							watchedObject.energyHighCutoff = v;
						}}
					/>
					<PropertyField children={<Divider />} />
					<Vector2PropertyField
						label='Divergence XY'
						value={watchedObject.divergence}
						unit={'mrad'}
						onChange={v => {
							watchedObject.divergence = { ...watchedObject.divergence, ...v };
						}}
					/>

					<NumberPropertyField
						label='Divergence distance to focal point'
						unit={editor.unit.name}
						value={watchedObject.divergence.distanceToFocal}
						onChange={v => {
							watchedObject.divergence.distanceToFocal = v;
						}}
					/>
					<PropertyField children={<Divider />} />

					<BeamSigmaField beam={watchedObject} />
				</>
			)}

			<PropertyField children={<Divider />} />
			<NumberPropertyField
				label='Number of primary particles'
				precision={0}
				step={1}
				value={watchedObject.numberOfParticles}
				onChange={v => {
					watchedObject.numberOfParticles = v;
				}}
			/>
			<PropertyField label='Particle type'>
				<ParticleSelect
					particles={PARTICLE_TYPES as unknown as IParticleType[]}
					value={watchedObject.particleData.id}
					onChange={(_, value) => {
						watchedObject.particleData.id = value;
						watchedObject.debouncedDispatchChanged();
					}}
				/>
			</PropertyField>

			{watchedObject.particleData.id === 25 && (
				<>
					<NumberPropertyField
						label='charge (Z)'
						precision={0}
						step={1}
						value={watchedObject.particleData.z}
						onChange={v => {
							watchedObject.particleData.z = v;
							watchedObject.debouncedDispatchChanged();
						}}
					/>
					<NumberPropertyField
						label='nucleons (A)'
						precision={0}
						step={1}
						value={watchedObject.particleData.a}
						onChange={v => {
							watchedObject.particleData.a = v;
							watchedObject.debouncedDispatchChanged();
						}}
					/>
				</>
			)}

			{props.object.beamSourceType === BEAM_SOURCE_TYPE.file && (
				<>
					<PropertyField children={<Divider />} />

					<BeamDefinitionField beam={watchedObject} />
				</>
			)}
		</>
	);
}

export function BeamConfiguration(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const visibleFlag = isBeam(object);

	return (
		<PropertiesCategory category='Beam Configuration' visible={visibleFlag}>
			{visibleFlag && <BeamConfigurationFields editor={editor} object={object} />}
		</PropertiesCategory>
	);
}
