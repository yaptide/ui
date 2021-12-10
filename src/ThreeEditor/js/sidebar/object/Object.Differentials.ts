import * as Scoring from '../../../util/Scoring/ScoringOutputTypes';
import { DifferentialModifier } from '../../../util/Scoring/ScoringQtyModifiers';
import { ScoringQuantity } from '../../../util/Scoring/ScoringQuantity';
import {
	createDifferentialConfigurationRow,
	createFullwidthButton,
	createModifiersOutliner,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import {
	RemoveDifferentialModifierCommand,
	AddDifferentialModifierCommand
} from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UIBreak, UIButton, UICheckbox, UINumber, UIRow, UISelect } from '../../libs/ui';
import { UIOutliner } from '../../libs/ui.three';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectDifferentials extends ObjectAbstract {
	object?: ScoringQuantity;
	modifier?: DifferentialModifier;
	addRow: UIRow;
	add: UIButton;

	outliner: UIOutliner;

	modifierRow: UIRow;
	keywordSelect: UISelect;
	lowerLimit: UINumber;
	upperLimit: UINumber;
	binsNumber: UINumber;
	logCheckbox: UICheckbox;
	removeButton: UIButton;
	constructor(editor: Editor) {
		super(editor, 'Differential scoring');
		[this.addRow, this.add] = createFullwidthButton({
			text: 'Add differential modifier',
			update: this.addModifier.bind(this)
		});
		[this.outliner] = createModifiersOutliner(editor, {
			update: this.selectModifier.bind(this)
		});
		[
			this.modifierRow,
			this.keywordSelect,
			this.lowerLimit,
			this.upperLimit,
			this.binsNumber,
			this.logCheckbox,
			this.removeButton
		] = createDifferentialConfigurationRow({
			update: this.update.bind(this),
			delete: this.removeModifier.bind(this),
			options: Scoring.DETECTOR_MODIFIERS_OPTIONS
		});
		this.panel.add(this.addRow, this.outliner, new UIBreak(), this.modifierRow);
		editor.signals.scoringQuantityChanged.add(() =>
			this.object ? this.setObject(this.object) : null
		);
	}
	setObject(object: ScoringQuantity): void {
		super.setObject(object);
		if (!object) return;
		this.object = object;
		this.outliner.setOptions(object.modifiers);
		if (object.selectedModifier) {
			const rule = object.selectedModifier;
			if (rule) {
				this.outliner.setValue(object.selectedModifier.uuid);
				this.setModifier(rule);
			} else {
				object.selectedModifier = undefined;
				hideUIElement(this.modifierRow);
			}
		} else {
			hideUIElement(this.modifierRow);
		}
	}
	update(): void {
		const { object, modifier } = this;
		if (!object || !modifier) return;
		const { uuid } = modifier;
		const diffType = this.keywordSelect.getValue() as Scoring.DETECTOR_MODIFIERS;
		const lowerLimit = this.lowerLimit.getValue();
		const upperLimit = this.upperLimit.getValue();
		this.lowerLimit.max = upperLimit;
		this.upperLimit.min = lowerLimit;
		const binsNumber = this.binsNumber.getValue();
		const isLog = this.logCheckbox.getValue();
		this.editor.execute(
			new AddDifferentialModifierCommand(
				this.editor,
				object,
				DifferentialModifier.fromJSON({
					uuid,
					diffType,
					lowerLimit,
					upperLimit,
					binsNumber,
					isLog
				})
			)
		);
	}
	addModifier(): void {
		const { editor, object } = this;
		editor.execute(new AddDifferentialModifierCommand(editor, object));
	}
	selectModifier(): void {
		const { object } = this;
		if (!object) return;
		const modifier = object.getModifierByUuid(this.outliner.getValue());
		object.selectedModifier = modifier;
		if (modifier) {
			this.setModifier(modifier);
		} else {
			this.outliner.setValue(null);
			this.modifier = undefined;
			hideUIElement(this.modifierRow);
		}
	}
	setModifier(modifier: DifferentialModifier) {
		showUIElement(this.modifierRow, 'grid');
		this.modifier = modifier;
		this.outliner.setValue(modifier.uuid);
		this.updateSelectedModifier();
	}
	updateSelectedModifier() {
		const { modifier } = this;
		if (!modifier) return;
		const { diffType, lowerLimit, upperLimit, binsNumber, isLog } = modifier;
		this.keywordSelect.setValue(diffType);
		this.lowerLimit.setValue(lowerLimit);
		this.upperLimit.setValue(upperLimit);
		this.lowerLimit.max = upperLimit;
		this.upperLimit.min = lowerLimit;
		this.binsNumber.setValue(binsNumber);
		this.logCheckbox.setValue(isLog);
	}

	removeModifier() {
		const { object, editor, modifier } = this;
		if (!object || !modifier) return;
		editor.execute(new RemoveDifferentialModifierCommand(editor, object, modifier));
	}
}
