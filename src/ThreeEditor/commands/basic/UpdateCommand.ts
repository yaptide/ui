import { YaptideEditor } from '../../js/YaptideEditor';
import { BaseCommandJSON, Command } from './AbstractCommand';

/**
 * UpdateCommand is a command that updates a property of a target
 * and stores the old value for undo purposes
 *
 * The property must be of a type that can be serialized to JSON and can't be read-only
 * Any listeners to the property must be a pure functions so that the command can be undone
 */
export class UpdateCommand<
	Target extends Record<string, unknown> & Record<Property, Target[Property]>,
	Property extends keyof Target
> extends Command<Target> {
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
		const data = { property: this.property, oldValue: this.oldValue, newValue: this.newValue };
		return { ...super.toJSON(), data };
	}

	fromJSON(json: UpdateCommandJSON<Target, Property>): void {
		super.fromJSON(json);
		const { property, oldValue, newValue } = json.data;
		this.property = property;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}
}

//-----------------------------------------UtilityTypes-----------------------------------------//
type UpdateCommandJSON<
	Target extends Record<string, unknown>,
	Property extends keyof Target
> = BaseCommandJSON<Target> & {
	data: {
		property: Property;
		oldValue: Target[Property];
		newValue: Target[Property];
	};
};
//----------------------------------------------------------------------------------------------//
