import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param newRules RulesJSON[]
 * @constructor
 */
export class SetFilterRulesCommand extends Command {
	constructor(editor, filter, newRules) {
		super(editor);

		this.type = 'SetFilterRulesCommand';
		this.name = 'Set Filter Rules';
		this.updatable = true;

		this.filter = filter;
		this.oldRules = filter.rules.map(rule => rule.toJSON());
		this.newRules = newRules;
	}

	execute() { }
}
