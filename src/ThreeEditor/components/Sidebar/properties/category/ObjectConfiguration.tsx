import { Object3D } from 'three';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import {
	BEAM_MODULATOR_MODE_OPTIONS,
	isBeamModulator
} from '../../../../Simulation/SpecialComponents/BeamModulator';
import { isCTCube } from '../../../../Simulation/SpecialComponents/CTCube';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { SelectPropertyField, TextPropertyField } from '../fields/PropertyField';
import { SourceFileDefinitionField } from '../fields/SourceFileField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = isCTCube(watchedObject) || isBeamModulator(watchedObject);

	const setValueCommand = (value: any, key: string) => {
		editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));
	};

	return (
		<PropertiesCategory
			category='Configuration'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					{isCTCube(watchedObject) ? (
						<TextPropertyField
							label='Path on server'
							value={watchedObject.pathOnServer}
							onChange={value => {
								editor.execute(
									new SetValueCommand(
										editor,
										watchedObject.object,
										'pathOnServer',
										value
									)
								);
							}}
						/>
					) : (
						<>
							<SelectPropertyField
								label='Modulator mode'
								value={watchedObject.simulationMethod}
								onChange={value => {
									editor.execute(
										new SetValueCommand(
											editor,
											watchedObject.object,
											'simulationMethod',
											value
										)
									);
								}}
								options={BEAM_MODULATOR_MODE_OPTIONS}
							/>

							<SourceFileDefinitionField
								object={watchedObject}
								onChange={v => {
									setValueCommand(v, 'sourceFile');
								}}
							/>
						</>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
