import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param newRules RulesJSON[]
 * @constructor
 */
export class SetFilterRulesCommand extends Command {
	constructor(editor, object, newRules) {
		super(editor);

		this.type = 'SetFilterRulesCommand';
		this.name = 'Set Filter Rules';
		this.updatable = true;

		this.object = object;

		this.filter = object;
		this.oldRules = object.rules.map(rule => rule.toJSON());
		this.newRules = newRules;
	}

	execute() {}
}
