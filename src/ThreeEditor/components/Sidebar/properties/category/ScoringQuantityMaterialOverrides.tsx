import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Object3D } from 'three';

import { SimulatorType } from '../../../../../types/RequestTypes';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetMaterialColorCommand } from '../../../../js/commands/SetMaterialColorCommand';
import { SetMaterialValueCommand } from '../../../../js/commands/SetMaterialValueCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { SetZoneMaterialCommand } from '../../../../js/commands/SetZoneMaterialCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isSimulationMesh } from '../../../../Simulation/Base/SimulationMesh';
import { isSimulationPoints } from '../../../../Simulation/Base/SimulationPoints';
import { isSimulationZone, SimulationZone } from '../../../../Simulation/Base/SimulationZone';
import { CustomStoppingPowerModels } from '../../../../Simulation/CustomStoppingPower/CustomStoppingPower';
import { isBeam } from '../../../../Simulation/Physics/Beam';
import { isScoringQuantity, ScoringQuantity } from '../../../../Simulation/Scoring/ScoringQuantity';
import { isWorldZone } from '../../../../Simulation/Zones/WorldZone/WorldZone';
import { MaterialSelect } from '../../../Select/MaterialSelect';
import {
	ColorInput,
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
		isScoringQuantity(watchedObject) && watchedObject.keyword! && watchedObject.hasMaterial!;

	const { state: editorPhysic } = useSmartWatchEditorState(editor, editor.physic);

	const stoppingPowerAvailable = (object: ScoringQuantity) =>
		object.material!.icru in CustomStoppingPowerModels[editorPhysic.stoppingPowerTable];

	return (
		<PropertiesCategory
			category='Material'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
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
