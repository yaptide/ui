import {
	RemoveDetectGeometryCommand,
	RemoveFilterCommand,
	RemoveObjectCommand,
	RemoveZoneCommand,
	SetFilterRuleCommand,
	RemoveDifferentialModifierCommand,
	RemoveQuantityCommand
} from '../commands/Commands';
import { UIInput, UIPanel, UIRow, UIText } from '../libs/ui.js';

function MenubarSettingsShortcuts(editor) {
	const { signals, config } = editor;

	const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

	function isValidKeyBinding(key) {
		return key.match(/^[A-Za-z0-9]$/i); // Can't use z currently due to undo/redo
	}

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add(new UIText('Shortcuts'.toUpperCase()));
	container.add(headerRow);

	const shortcuts = ['translate', 'rotate', 'scale', 'undo', 'focus'];

	function createShortcutInput(name) {
		const configName = 'settings/shortcuts/' + name;
		const shortcutRow = new UIRow();

		const shortcutInput = new UIInput().setWidth('15px').setFontSize('12px');
		shortcutInput.setTextAlign('center');
		shortcutInput.setTextTransform('lowercase');
		shortcutInput.onChange(() => {
			const value = shortcutInput.getValue().toLowerCase();

			if (isValidKeyBinding(value)) {
				config.setKey(configName, value);
			}
		});

		// Automatically highlight when selecting an input field
		shortcutInput.dom.addEventListener('click', () => {
			shortcutInput.dom.select();
		});

		// If the value of the input field is invalid, revert the input field
		// to contain the key binding stored in config
		shortcutInput.dom.addEventListener('blur', () => {
			if (!isValidKeyBinding(shortcutInput.getValue())) {
				shortcutInput.setValue(config.getKey(configName));
			}
		});

		// If a valid key binding character is entered, blur the input field
		shortcutInput.dom.addEventListener('keyup', event => {
			if (isValidKeyBinding(event.key)) {
				shortcutInput.dom.blur();
			}
		});

		if (config.getKey(configName) !== undefined) {
			shortcutInput.setValue(config.getKey(configName));
		}

		shortcutInput.dom.maxLength = 1;
		shortcutRow.add(new UIText(name).setTextTransform('capitalize').setWidth('90px'));
		shortcutRow.add(shortcutInput);

		container.add(shortcutRow);
	}

	for (let i = 0; i < shortcuts.length; i++) {
		createShortcutInput(shortcuts[i]);
	}

	const getRemoveCommand = (editor, object) => {
		switch (true) {
			case object.isDetectGeometry:
				return new RemoveDetectGeometryCommand(editor, object);
			case object.isZone:
				return new RemoveZoneCommand(editor, object);
			case object.isFilter:
				if (object.selectedRule) return new SetFilterRuleCommand(editor, object);
				return new RemoveFilterCommand(editor, object);
			case object.isQuantity:
				if (object.selectedModifier)
					return new RemoveDifferentialModifierCommand(
						editor,
						object,
						object.selectedModifier
					);
				return new RemoveQuantityCommand(editor, object, object.parent);
			default:
				return new RemoveObjectCommand(editor, object);
		}
	};

	editor.container.addEventListener(
		'keydown',
		event => {
			switch (event.key.toLowerCase()) {
				case 'delete':
					const object = editor.selected;

					if (object === null || object.notRemovable === true) return;

					const parent = object.parent;
					if (parent !== null) editor.execute(getRemoveCommand(editor, object));
					break;

				case config.getKey('settings/shortcuts/translate'):
					signals.transformModeChanged.dispatch('translate');

					break;

				case config.getKey('settings/shortcuts/rotate'):
					signals.transformModeChanged.dispatch('rotate');

					break;

				case config.getKey('settings/shortcuts/scale'):
					signals.transformModeChanged.dispatch('scale');

					break;

				case config.getKey('settings/shortcuts/undo'):
					if (IS_MAC ? event.metaKey : event.ctrlKey) {
						event.preventDefault(); // Prevent browser specific hotkeys

						if (event.shiftKey) {
							editor.redo();
						} else {
							editor.undo();
						}
					}

					break;

				case config.getKey('settings/shortcuts/focus'):
					if (editor.selected !== null) {
						editor.focus(editor.selected);
					}

					break;

				default:
					break;
			}
		},
		false
	);

	return container;
}

export { MenubarSettingsShortcuts };
