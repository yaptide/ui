import { YaptideEditor } from '../../js/YaptideEditor';
import { AbstractCommand,BaseCommandJSON } from './AbstractCommand';

/**
 * UpdateCommand is a command that updates a property of a target
 * and stores the old value for undo purposes
 *
 * The property must be of a type that can be serialized to JSON and can't be read-only
 * Any listeners to the property must be a pure functions so that the command can be undone
 */
export class UpdateCommand<
	Target extends Record<Property, Target[Property]>,
	Property extends keyof Target
> extends AbstractCommand<Target> {
	property: Property;
	oldValue: Target[Property];
	newValue: Target[Property];
	constructor(
		editor: YaptideEditor,
		target: Target,
		name: string,
		property: Property,
		newValue: Target[Property],
		id = -1,
		updatable = false
	) {
		super(editor, target, 'UpdateCommand', name, id, updatable);
		this.property = property;
		this.oldValue = target[property];
		this.newValue = newValue;
	}

	execute() {
		this.target[this.property] = this.newValue;
	}

	undo() {
		this.target[this.property] = this.oldValue;
	}

	toJSON(): UpdateCommandJSON<Target, Property> {
		const { property, oldValue, newValue, target } = this;

		return { ...super.toJSON(), target, data: { property, oldValue, newValue } };
	}

	static fromJSON<
		Target extends Record<Property, Target[Property]>,
		Property extends keyof Target
	>(editor: YaptideEditor, json: UpdateCommandJSON<Target, Property>) {
		const command = new UpdateCommand(
			editor,
			json.target,
			json.name,
			json.data.property,
			json.data.newValue,
			json.id,
			json.updatable
		);
		command.oldValue = json.data.oldValue;

		return command;
	}
}

//-----------------------------------------UtilityTypes-----------------------------------------//
type UpdateCommandJSON<
	Target extends Record<string, unknown>,
	Property extends keyof Target
> = BaseCommandJSON & {
	target: Target;
	data: {
		property: Property;
		oldValue: Target[Property];
		newValue: Target[Property];
	};
};
//----------------------------------------------------------------------------------------------//
