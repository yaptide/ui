import { YaptideEditor } from '../../js/YaptideEditor';
import { AbstractCommand, BaseCommandJSON, Command } from './AbstractCommand';
import { ActionCommand } from './ActionCommand';
import { UpdateCommand } from './UpdateCommand';

export class CompoundCommand implements Command {
	editor;
	private _type: string;
	get type() {
		return this._type;
	}

	name;
	id;
	readonly updatable;
	inMemory;
	commands: Command[];

	constructor(
		editor: YaptideEditor,
		name: string,
		commands: Command[],
		id = -1,
		updatable = false
	) {
		this.editor = editor;
		this._type = 'CompoundCommand';
		this.name = name;
		this.id = id;
		this.updatable = updatable;
		this.inMemory = true;
		this.commands = commands;
	}

	execute = () => this.commands.forEach(command => command.execute());

	undo = () => this.commands.toReversed().forEach(command => command.undo());

	toJSON(): CompoundCommandJSON {
		const { name, id, updatable, type } = this;
		const commands = this.commands.map(command => command.toJSON());

		return { name, id, updatable, type, commands };
	}

	static fromJSON(editor: YaptideEditor, json: CompoundCommandJSON) {
		const commands: Command[] = json.commands.map(command => {
			switch (command.type) {
				case 'ActionCommand':
					return ActionCommand.fromJSON(editor, command as any);
				case 'UpdateCommand':
					return UpdateCommand.fromJSON(editor, command as any);
				case 'CompoundCommand':
					return CompoundCommand.fromJSON(editor, command as any);
				default:
					throw new Error(`Unknown command type ${command.type}`);
			}
		});

		return new CompoundCommand(editor, json.name, commands, json.id, json.updatable);
	}
}

type CompoundCommandJSON = BaseCommandJSON & {
	commands: BaseCommandJSON[];
};
