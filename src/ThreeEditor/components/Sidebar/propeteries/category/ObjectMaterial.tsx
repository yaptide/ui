import { Editor } from '../../../../js/Editor';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Object3D } from 'three';
import { isZone } from '../../../../util/CSG/CSGZone';
import { ColorInput, ConditionalNumberPropertyField, PropertyField } from '../fields/PropertyField';
import { SetMaterialColorCommand } from '../../../../js/commands/SetMaterialColorCommand';
import { isBeam } from '../../../../util/Beam';
import { isBasicMesh } from '../../../../util/BasicMeshes';
import { isDetectGeometry } from '../../../../util/Detect/DetectGeometry';
import { MaterialSelect } from '../../../Select/MaterialSelect';
import { SetZoneMaterialCommand } from '../../../../js/commands/SetZoneMaterialCommand';
import { SetMaterialValueCommand } from '../../../../js/commands/SetMaterialValueCommand';
import { isWorldZone } from '../../../../util/WorldZone/WorldZone';

export function ObjectMaterial(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag =
		isZone(watchedObject) ||
		isBeam(watchedObject) ||
		isWorldZone(watchedObject) ||
		isBasicMesh(watchedObject) ||
		isDetectGeometry(watchedObject);

	const { state: watchedObjectMaterial } = useSmartWatchEditorState(
		editor,
		visibleFlag ? watchedObject.material : null
	);

	return (
		<PropertiesCategory category='Material' visible={visibleFlag}>
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
