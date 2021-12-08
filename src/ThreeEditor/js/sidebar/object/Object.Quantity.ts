import { ScoringOutput } from '../../../util/Scoring/ScoringOutput';
import { DETECTOR_KEYWORD_OPTIONS } from '../../../util/Scoring/ScoringOutputTypes';
import { ScoringQuantity } from '../../../util/Scoring/ScoringQuantity';
import {
	createFullwidthButton,
	createRowConditionalNumber,
	createRowConditionalSelect,
	createRowSelect,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import {
	AddQuantityCommand,
	SetOutputSettingsCommand,
	SetQuantityValueCommand
} from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UIButton, UICheckbox, UINumber, UIPanel, UIRow, UISelect, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectQuantity extends ObjectAbstract {
	object?: ScoringQuantity;

	keywordRow: UIRow;
	keyword: UISelect;

	filterRow: UIRow;
	filterCheckbox: UICheckbox;
	filter: UISelect;
	constructor(editor: Editor) {
		super(editor, 'Quantity configuration');
		[this.keywordRow, this.keyword] = createRowSelect({
			text: 'Keyword',
			update: this.update.bind(this),
			options: DETECTOR_KEYWORD_OPTIONS
		});
		[this.filterRow, this.filterCheckbox, this.filter] = createRowConditionalSelect({
			text: 'Filter',
			update: this.update.bind(this)
		});
		this.panel.add(this.keywordRow, this.filterRow);
	}

	setObject(object: ScoringQuantity): void {
		super.setObject(object);
		if (!object) return;
		this.object = object;
		this.keyword.setValue(object.keyword);
		const { filter, hasFilter } = object;
		this.filter.setOptions(this.editor.detectManager.getFilterOptions());
		if (hasFilter) {
			showUIElement(this.filter);
			this.filter.setValue(filter?.uuid);
		} else hideUIElement(this.filter);
		this.filterCheckbox.setValue(hasFilter);
	}

	update(): void {
		if (!this.object) return;
		const { object, editor } = this;
		const { filter, keyword, hasFilter } = this.object;
		const newKeyword = this.keyword.getValue();
		const newFilter = editor.detectManager.getFilterByUuid(this.filter.getValue());
		const newHasFilter = this.filterCheckbox.getValue();
		const commands = [];
		if (keyword !== newKeyword)
			commands.push(new SetQuantityValueCommand(editor, object, 'keyword', newKeyword));
		if (newHasFilter !== hasFilter)
			commands.push(new SetQuantityValueCommand(editor, object, 'hasFilter', newHasFilter));
		if (filter?.uuid !== newFilter?.uuid)
			commands.push(new SetQuantityValueCommand(editor, object, 'filter', newFilter));
		commands.forEach(command => this.editor.execute(command));
	}
}
