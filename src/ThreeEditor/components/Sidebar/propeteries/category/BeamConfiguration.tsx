import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Beam, isBeam } from '../../../../util/Beam';
import { NumberPropertyField, PropertyField, Vector2PropertyField } from '../fields/PropertyField';
import { PARTICLE_TYPES } from '../../../../util/particles';
import { IParticleType, ParticleSelect } from '../../../Select/ParticlesSelect';
import { Box, Divider, Stack, TextareaAutosize } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'throttle-debounce';

function BeamDefinitionField(props: { beam: Beam }) {
	const [state, setState] = useState(props.beam.definitionFile);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const setStateDebounce = useCallback(
		debounce(200, (value: string) => setState(value)),
		[setState]
	);

	useEffect(() => {
		setStateDebounce(props.beam.definitionFile);
	}, [props.beam.definitionFile, setStateDebounce]);

	useEffect(() => {
		return () => {
			setStateDebounce.cancel();
		};
	}, [setStateDebounce]);

	return (
		<PropertyField>
			<Stack gap={1}>
				<Box>Beam Definition</Box>
				<TextareaAutosize
					value={state}
					style={{
						width: '100%',
						borderColor: 'rgba(0,0,0,.5)',
						maxHeight: 300,
						overflow: 'auto'
					}}
					minRows={5}
					onChange={e => {
						props.beam.definitionFile = e.target.value;
						setState(e.target.value);
					}}
				/>
			</Stack>
		</PropertyField>
	);
}

export function BeamConfiguration(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as Beam, true);

	const visibleFlag = isBeam(watchedObject);

	return (
		<PropertiesCategory category='Beam Configuration' visible={visibleFlag}>
			{visibleFlag && (
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
					<Vector2PropertyField
						label='Beam sigma'
						value={watchedObject.beamSigma}
						onChange={v => {
							watchedObject.beamSigma = v;
						}}
					/>
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

					<PropertyField children={<Divider />} />

					<BeamDefinitionField beam={watchedObject} />
				</>
			)}
		</PropertiesCategory>
	);
}
