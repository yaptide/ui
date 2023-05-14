import { Editor } from '../../../../js/Editor';
import { PropertiesCategory } from './PropertiesCategory';

export function BeamModifiersConfiguration(props: { editor: Editor }) {
	const { editor } = props;

	// const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	// const setValue = (key: string, value: any) =>
	// 	editor.execute(new SetValueCommand(editor, watchedObject.object, key, value));

	return (
		<PropertiesCategory category='Beam Modulator'>
			{/*
         TODO: implement configuration for beam modifiers
         */}
		</PropertiesCategory>
	);
}
