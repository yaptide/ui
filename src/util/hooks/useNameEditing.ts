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
	const [draft, setDraft] = useState<{ object: Object3D; value: string } | null>(null);
	const cancelledRef = useRef(false);
	const draftValue = draft?.object === object ? draft.value : null;

	const onBlur = () => {
		const newName = draftValue?.trim();

		if (!cancelledRef.current && newName) {
			const command = new SetValueCommand(editor, object, 'name', newName);

			if (command.newValue !== name) editor.execute(command);
		}

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
		value: draftValue ?? name,
		onChange: (value: string) => setDraft({ object, value }),
		onBlur,
		onKeyDown
	};
};
