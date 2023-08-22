import { Command } from '../Command';

/**
 * @param editor Editor
 * @param filter DetectFilter
 * @param object RulesJSON[]
 * @constructor
 */
export class SetFilterRuleCommand extends Command {
	constructor(editor, filter, object) {
		super(editor);

		this.type = 'SetFilterRuleCommand';
		this.name = 'Set Filter Rule';
		this.updatable = true;

		this.filter = filter;

		this.object = object;
		this.oldRule = filter
			.getRuleByUuid(object ? object.uuid : filter.selectedRule.uuid)
			?.toJSON();
	}

	execute() {
		if (this.object) this.filter.updateOrCreateRule(this.object);
		else this.filter.removeRule(this.oldRule.uuid);
		this.editor.signals.detectFilterChanged.dispatch(this.filter);
		this.editor.signals.objectChanged.dispatch(this.filter, 'rules');
	}

	undo() {
		if (this.oldRule) this.filter.updateOrCreateRule(this.oldRule);
		else this.filter.removeRule(this.object.uuid);
		this.editor.signals.detectFilterChanged.dispatch(this.filter);
		this.editor.signals.objectChanged.dispatch(this.filter, 'rules');
	}

	update(command) {
		this.object = command.object;
	}

	toJSON() {
		const output = super.toJSON(this);
		output.object = this.object.toJSON();
		output.oldRule = this.oldRule;
		output.filter = this.filter.toJSON();

		return output;
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.filter =
			this.editor.detectorManager.getFilterByUuid(json.filter.uuid) ??
			this.editor.detectorManager.createFilter().fromJSON(json.filter);
		this.object = json.object;
		this.oldRule = json.oldRule;
	}
}
