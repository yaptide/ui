import { Editor } from '../../js/Command';
import { BaseCommandJSON, Command } from './AbstractCommand';

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

export class UpdateCommand<
	Target extends Record<string, unknown> & Record<Property, Target[Property]>,
	Property extends keyof Target
> extends Command<Target> {
	property: Property;
	oldValue: Target[Property];
	newValue: Target[Property];
	constructor(
		editor: Editor,
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
