import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { SelectPropertyField, TextPropertyField } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { isCTCube } from '../../../../Simulation/SpecialComponents/CTCube';
import {
	BEAM_MODULATOR_MODE_OPTIONS,
	isBeamModulator
} from '../../../../Simulation/SpecialComponents/BeamModulator';

export function Configuration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const visibleFlag = isCTCube(watchedObject) || isBeamModulator(watchedObject);

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
						<SelectPropertyField
							label='Modulator mode'
							value={watchedObject.modulatorMode}
							onChange={value => {
								editor.execute(
									new SetValueCommand(
										editor,
										watchedObject.object,
										'modulatorMode',
										value
									)
								);
							}}
							options={BEAM_MODULATOR_MODE_OPTIONS}
						/>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
