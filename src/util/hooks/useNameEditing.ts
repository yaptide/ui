import { KeyboardEvent, useRef, useState } from 'react';
import { Object3D } from 'three';

import { SetValueCommand } from '../../ThreeEditor/js/commands/SetValueCommand';
import { YaptideEditor } from '../../ThreeEditor/js/YaptideEditor';

export const useNameEditing = (
	editor: YaptideEditor,
	object: Object3D,
	name: string,
	onFinish?: () => void
) => {
	const [draft, setDraft] = useState<string | null>(null);
	const cancelledRef = useRef(false);

	const onBlur = () => {
		if (!cancelledRef.current && draft !== null && draft.trim() !== '' && draft !== name)
			editor.execute(new SetValueCommand(editor, object, 'name', draft));

		cancelledRef.current = false;
		setDraft(null);
		onFinish?.();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== 'Enter' && event.key !== 'Escape') return;

		event.preventDefault();
		cancelledRef.current = event.key === 'Escape';

		if (event.target instanceof HTMLElement) event.target.blur();
	};

	return {
		value: draft ?? name,
		onChange: (value: string) => setDraft(value),
		onBlur,
		onKeyDown
	};
};
