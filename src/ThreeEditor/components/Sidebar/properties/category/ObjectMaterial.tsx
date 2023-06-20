import { Object3D } from 'three';

import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetMaterialColorCommand } from '../../../../js/commands/SetMaterialColorCommand';
import { SetMaterialValueCommand } from '../../../../js/commands/SetMaterialValueCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { SetZoneMaterialCommand } from '../../../../js/commands/SetZoneMaterialCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isSimulationMesh } from '../../../../Simulation/Base/SimulationMesh';
import { isSimulationPoints } from '../../../../Simulation/Base/SimulationPoints';
import { isSimulationZone } from '../../../../Simulation/Base/SimulationZone';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { isWorldZone } from '../../../../Simulation/Zones/WorldZone/WorldZone';
import { MaterialSelect } from '../../../Select/MaterialSelect';
import { ColorInput, ConditionalNumberPropertyField, PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectMaterial(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag =
		isSimulationZone(watchedObject) ||
		isWorldZone(watchedObject) || //TODO: Refactor WorldZone to extend  a Zone
		isSimulationMesh(watchedObject) ||
		isBeam(watchedObject) ||
		isSimulationPoints(watchedObject);

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
					{(isSimulationZone(watchedObject) || isWorldZone(watchedObject)) && (
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

					{isSimulationZone(watchedObject) && (
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
