import { Editor } from '../../../../js/Editor';
import { PropertiesCategory } from './PropertiesCategory';

export function BeamModifiersConfiguration(props: { editor: Editor }) {
	const { editor } = props;

	// const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	// const setValue = (key: string, value: any) =>
	// 	editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));

	return (
		<PropertiesCategory category='Beam Modulator'>
			{/* <NumberPropertyField
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
			/> */}
		</PropertiesCategory>
	);
}
