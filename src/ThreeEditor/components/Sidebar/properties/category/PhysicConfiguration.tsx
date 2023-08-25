import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import {
	ENERGY_MODEL_STRAGGLING,
	MULTIPLE_SCATTERING,
	Physics,
	STOPPING_POWER_TABLE
} from '../../../../Simulation/Physics/Physics';
import {
	BooleanPropertyField,
	NumberPropertyField,
	SelectPropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function PhysicConfiguration(props: { editor: YaptideEditor; object: Physics }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const setValue = (key: string, value: any) =>
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));

	return (
		<PropertiesCategory category='Physic Configuration'>
			<NumberPropertyField
				label='Energy loss (DELTAE)'
				value={watchedObject.energyLoss}
				onChange={value => setValue('energyLoss', value)}
			/>
			<></>
			<BooleanPropertyField
				label='Enable nuclear reactions (NUCRE)'
				value={watchedObject.enableNuclearReactions}
				onChange={value => setValue('enableNuclearReactions', value)}
			/>

			<SelectPropertyField
				label='Energy Model Straggling (STRAGG)'
				value={watchedObject.energyModelStraggling}
				onChange={value => setValue('energyModelStraggling', value)}
				options={Object.keys(ENERGY_MODEL_STRAGGLING)}
			/>

			<SelectPropertyField
				label='Multiple Scattering (MSCAT)'
				value={watchedObject.multipleScattering}
				onChange={value => setValue('multipleScattering', value)}
				options={Object.keys(MULTIPLE_SCATTERING)}
			/>

			<SelectPropertyField
				label='Custom Stopping Power Table'
				value={watchedObject.stoppingPowerTable}
				onChange={value => setValue('stoppingPowerTable', value)}
				options={Object.keys(STOPPING_POWER_TABLE)}
			/>
		</PropertiesCategory>
	);
}
