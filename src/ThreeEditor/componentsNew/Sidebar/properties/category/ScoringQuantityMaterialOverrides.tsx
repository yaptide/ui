import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetQuantityOverriddenMaterialCommand } from '../../../../js/commands/SetQuantityOverriddenMaterialCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { CustomStoppingPowerModels } from '../../../../Simulation/CustomStoppingPower/CustomStoppingPower';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { MaterialSelect } from '../../../Select/MaterialSelect';
import {
	ConditionalNumberPropertyField,
	ConditionalPropertyField,
	PropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ScoringQuantityMaterialOverrides(props: {
	editor: YaptideEditor;
	object: Object3D;
}) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag =
		isScoringQuantity(watchedObject) &&
		editor.contextManager.currentSimulator !== SimulatorType.GEANT4 &&
		watchedObject.keyword! &&
		watchedObject.hasMaterial!;

	const { state: editorPhysic } = useSmartWatchEditorState(editor, editor.physic);

	const stoppingPowerAvailable = (object: ScoringQuantity) =>
		object.material!.icru in CustomStoppingPowerModels[editorPhysic.stoppingPowerTable];

	return (
		<PropertiesCategory
			category='Material'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField label='Simulation'>
						<MaterialSelect
							materials={editor.materialManager.materials}
							value={watchedObject.material!.icru + ''}
							onChange={(_, v) => {
								editor.execute(
									new SetQuantityOverriddenMaterialCommand(
										editor,
										watchedObject.object,
										v
									)
								);
							}}
						/>
					</PropertyField>
					<ConditionalNumberPropertyField
						min={0.0}
						unit='g/cm^3'
						label='Custom density'
						value={watchedObject.materialPropertiesOverrides!.density.value}
						onChange={v => {
							const newValue = {
								...watchedObject.materialPropertiesOverrides,
								density: {
									...watchedObject.materialPropertiesOverrides!.density,
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
						enabled={watchedObject.materialPropertiesOverrides!.density.override}
						onChangeEnabled={v => {
							const newValue = {
								...watchedObject.materialPropertiesOverrides,
								density: {
									...watchedObject.materialPropertiesOverrides!.density,
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
					{editor.contextManager.currentSimulator === SimulatorType.SHIELDHIT && (
						<ConditionalPropertyField
							propertyDisabled={!stoppingPowerAvailable(watchedObject)}
							label='Custom stopping power'
							info={`Stopping table can be changed in settings. ${
								!stoppingPowerAvailable(watchedObject)
									? 'IMPORTANT: This setting is ignored. Material has no available custom stopping power in table. Default stopping power is used.'
									: ''
							}`}
							enabled={
								watchedObject.materialPropertiesOverrides!.customStoppingPower.value
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
								<Typography>{editorPhysic.stoppingPowerTable}</Typography>
							</Stack>
						</ConditionalPropertyField>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
