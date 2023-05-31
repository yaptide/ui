import * as Scoring from '../../../Simulation/Scoring/ScoringOutputTypes';
import { ScoringQuantity } from '../../../Simulation/Scoring/ScoringQuantity';
import {
	createRowConditionalNumber,
	createRowConditionalSelect,
	createRowSelect,
	hideUIElement,
	showUIElement
} from '../../../../util/Ui/Uis';
import { SetQuantityValueCommand } from '../../commands/Commands';
import { YaptideEditor } from '../../YaptideEditor';
import { UICheckbox, UINumber, UIRow, UISelect } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectQuantity extends ObjectAbstract {
	object?: ScoringQuantity;

	keywordRow: UIRow;
	keyword: UISelect;

	mediumRow: UIRow;
	medium: UISelect;

	filterRow: UIRow;
	filterCheckbox: UICheckbox;
	filter: UISelect;

	rescaleRow: UIRow;
	rescaleCheckbox: UICheckbox;
	rescale: UINumber;
	constructor(editor: YaptideEditor) {
		super(editor, 'Quantity configuration');
		[this.keywordRow, this.keyword] = createRowSelect({
			text: 'Quantity type',
			update: this.update.bind(this),
			options: Scoring.DETECTOR_KEYWORD_OPTIONS
		});

		[this.mediumRow, this.medium] = createRowSelect({
			text: 'Medium',
			update: this.update.bind(this),
			options: Scoring.MEDIUM_KEYWORD_OPTIONS
		});

		[this.filterRow, this.filterCheckbox, this.filter] = createRowConditionalSelect({
			text: 'Filter',
			update: this.update.bind(this)
		});
		[this.rescaleRow, this.rescaleCheckbox, this.rescale] = createRowConditionalNumber({
			text: 'Rescale',
			value: [false, 1],
			update: this.update.bind(this)
		});
		this.panel.add(this.keywordRow, this.mediumRow, this.filterRow, this.rescaleRow);
	}

	setObject(object: ScoringQuantity): void {
		super.setObject(object);
		if (!object) return;
		this.object = object;

		const { filter, hasFilter, rescale, hasRescale, medium, keyword } = object;
		this.keyword.setValue(keyword);

		if (['NEqvDose', 'NKERMA'].includes(keyword)) showUIElement(this.mediumRow);
		else hideUIElement(this.mediumRow);
		this.medium.setValue(medium ?? Scoring.MEDIUM_KEYWORD_OPTIONS.WATER);

		const options = this.editor.scoringManager.getFilterOptions();
		if (Object.keys(options).length > 0) {
			showUIElement(this.filterRow);
			this.filterCheckbox.setValue(hasFilter);
			this.filter.setOptions(options);
			this.filter.setValue(filter?.uuid);
			if (hasFilter) {
				showUIElement(this.filter);
				this.filter.setValue(filter?.uuid);
			} else hideUIElement(this.filter);
		} else hideUIElement(this.filterRow);

		if (hasRescale) {
			showUIElement(this.rescale);
			this.rescale.setValue(rescale);
		} else hideUIElement(this.rescale);
	}

	update(): void {
		if (!this.object) return;
		const { object, editor } = this;
		const { filter, keyword, hasFilter, medium, rescale, hasRescale } = this.object;
		const newKeyword = this.keyword.getValue();
		const newMedium = this.medium.getValue();
		const newFilter = editor.scoringManager.getFilterByUuid(this.filter.getValue());
		const newHasFilter = this.filterCheckbox.getValue();
		const newRescale = this.rescale.getValue();
		const newHasRescale = this.rescaleCheckbox.getValue();

		const commands = [];

		if (keyword !== newKeyword)
			commands.push(new SetQuantityValueCommand(editor, object, 'keyword', newKeyword));

		if (['NEqvDose', 'NKERMA'].includes(newKeyword)) {
			if (medium !== newMedium)
				commands.push(new SetQuantityValueCommand(editor, object, 'medium', newMedium));
		} else hideUIElement(this.mediumRow);

		if (newHasRescale !== hasRescale)
			commands.push(new SetQuantityValueCommand(editor, object, 'hasRescale', newHasRescale));

		if (rescale !== newRescale)
			commands.push(new SetQuantityValueCommand(editor, object, 'rescale', newRescale));

		if (newHasFilter !== hasFilter)
			commands.push(new SetQuantityValueCommand(editor, object, 'hasFilter', newHasFilter));

		if (filter?.uuid !== newFilter?.uuid)
			commands.push(new SetQuantityValueCommand(editor, object, 'filter', newFilter));

		commands.forEach(command => this.editor.execute(command));
	}
}
