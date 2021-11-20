import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param newRules RulesJSON[]
 * @constructor
 */
export class SetFilterCommand extends Command {
	constructor(editor, filter, newRules) {
		super(editor);

		this.type = 'SetFilterCommand';
		this.name = 'Set Filter';
		this.updatable = true;

		this.filter = filter;
		this.oldRules = filter.rules.map(rule => rule.toJSON());
		this.newRules = newRules;
	}

	execute() {}
}
