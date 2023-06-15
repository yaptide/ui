import { Editor } from '../../../../js/Editor';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Object3D } from 'three';
import { isZone } from '../../../../Simulation/Zones/BooleanZone';
import {
	ColorInput,
	ConditionalNumberPropertyField,
	ConditionalPropertyField,
	PropertyField
} from '../fields/PropertyField';
import { SetMaterialColorCommand } from '../../../../js/commands/SetMaterialColorCommand';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { isBasicFigure } from '../../../../Simulation/Figures/BasicFigures';
import { isDetectGeometry } from '../../../../Simulation/Detectors/DetectGeometry';
import { MaterialSelect } from '../../../Select/MaterialSelect';
import { SetZoneMaterialCommand } from '../../../../js/commands/SetZoneMaterialCommand';
import { SetMaterialValueCommand } from '../../../../js/commands/SetMaterialValueCommand';
import { isWorldZone } from '../../../../Simulation/Zones/WorldZone/WorldZone';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import Typography from '@mui/material/Typography/Typography';
import { InfoTooltip } from '../../../../../shared/components/tooltip/InfoTooltip';
import { Stack } from '@mui/material';

export function ObjectMaterial(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag =
		isZone(watchedObject) ||
		isBeam(watchedObject) ||
		isWorldZone(watchedObject) ||
		isBasicFigure(watchedObject) ||
		isDetectGeometry(watchedObject);

	const { state: watchedObjectMaterial } = useSmartWatchEditorState(
		editor,
		visibleFlag ? watchedObject.material : null
	);

	return (
		<PropertiesCategory
			category={isBeam(watchedObject) ? 'Visual properties' : 'Material'}
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					{(isZone(watchedObject) || isWorldZone(watchedObject)) && (
						<PropertyField label='Simulation'>
							<MaterialSelect
								materials={editor.materialManager.materials}
								value={watchedObject.simulationMaterial.icru + ''}
								onChange={(_, v) => {
									editor.execute(
										new SetZoneMaterialCommand(editor, watchedObject.object, v)
									);
								}}
							/>
						</PropertyField>
					)}

					{isZone(watchedObject) && (
						<>
							<ConditionalNumberPropertyField
								min={0.0}
								unit='g/cm^3'
								label='Custom density'
								value={watchedObject.materialPropertiesOverrides.density.value}
								onChange={v => {
									const newValue = {
										...watchedObject.materialPropertiesOverrides,
										density: {
											...watchedObject.materialPropertiesOverrides.density,
											value: v
										}
									};
									editor.execute(
										new SetValueCommand(
											editor,
											watchedObject.object,
											'materialPropertiesOverrides',
											newValue
										)
									);
								}}
								enabled={watchedObject.materialPropertiesOverrides.density.override}
								onChangeEnabled={v => {
									const newValue = {
										...watchedObject.materialPropertiesOverrides,
										density: {
											...watchedObject.materialPropertiesOverrides.density,
											override: v
										}
									};
									editor.execute(
										new SetValueCommand(
											editor,
											watchedObject.object,
											'materialPropertiesOverrides',
											newValue
										)
									);
								}}
							/>
							<ConditionalPropertyField
								label='Custom stopping power'
								enabled={
									watchedObject.materialPropertiesOverrides.customStoppingPower
										.value
								}
								onChangeEnabled={v => {
									const newValue = {
										...watchedObject.materialPropertiesOverrides,
										customStoppingPower: {
											value: v,
											override: v
										}
									};
									editor.execute(
										new SetValueCommand(
											editor,
											watchedObject.object,
											'materialPropertiesOverrides',
											newValue
										)
									);
								}}>
								<Stack
									direction='row'
									spacing={1}
									justifyContent='center'
									alignItems='center'>
									<Typography>{editor.physic.stoppingPowerTable}</Typography>
									<InfoTooltip title='Stopping table can be changed in settings' />
								</Stack>
							</ConditionalPropertyField>

							<ConditionalNumberPropertyField
								label='Opacity'
								value={watchedObjectMaterial?.opacity ?? 0}
								enabled={watchedObjectMaterial?.transparent ?? false}
								min={0}
								max={1}
								step={0.05}
								onChange={v =>
									editor.execute(
										new SetMaterialValueCommand(
											editor,
											watchedObject.object,
											'opacity',
											v
										)
									)
								}
								onChangeEnabled={v =>
									editor.execute(
										new SetMaterialValueCommand(
											editor,
											watchedObject.object,
											'transparent',
											v
										)
									)
								}
							/>
						</>
					)}

					<PropertyField label={'Color'}>
						<ColorInput
							value={watchedObjectMaterial?.color.getHexString() ?? '#ffffff'}
							onChange={v =>
								editor.execute(
									new SetMaterialColorCommand(
										editor,
										watchedObject.object,
										'color',
										v
									)
								)
							}
						/>
					</PropertyField>
				</>
			)}
		</PropertiesCategory>
	);
}
