import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { FLUKA_DEFAULTS, FlukaDefaults } from '../../../../Simulation/Physics/FlukaDefaults';
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

export function FlukaDefaultsConfiguration(props: {
	editor: YaptideEditor;
	object: FlukaDefaults;
}) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const setValue = (key: string, value: any) =>
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));

	return (
		<PropertiesCategory category='Physics Defaults'>
			<SelectPropertyField
				label='Defaults'
				value={watchedObject.defaults}
				onChange={value => setValue('energyModelStraggling', value)}
				options={Object.keys(FLUKA_DEFAULTS)}
			/>
		</PropertiesCategory>
	);
}
