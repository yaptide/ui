import { ScoringOutput } from '../../../Simulation/Scoring/ScoringOutput';
import {
	createFullwidthButton,
	createRowConditionalNumber,
	createRowConditionalSelect,
	createRowSelect,
	hideUIElement,
	showUIElement
} from '../../../../util/Ui/Uis';
import { AddQuantityCommand, SetOutputSettingsCommand } from '../../commands/Commands';
import { YaptideEditor } from '../../YaptideEditor';
import { UIButton, UICheckbox, UINumber, UIRow, UISelect } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectSettings extends ObjectAbstract {
	object?: ScoringOutput;

	geometryRow: UIRow;
	geometry: UISelect;

	traceRow: UIRow;
	trace: UICheckbox;
	traceFilter: UISelect;

	primariesRow: UIRow;
	primaries: UICheckbox;
	primariesMultiplier: UINumber;

	addQuantity: UIButton;
	addQuantityRow: UIRow;

	constructor(editor: YaptideEditor) {
		super(editor, 'Output configuration');

		[this.geometryRow, this.geometry] = createRowSelect({
			text: 'Detect geometry',
			update: this.update.bind(this)
		});
		[this.traceRow, this.trace, this.traceFilter] = createRowConditionalSelect({
			text: 'Tracing',
			update: this.update.bind(this)
		});
		[this.primariesRow, this.primaries, this.primariesMultiplier] = createRowConditionalNumber({
			text: 'Primaries',
			precision: 0,
			step: 1,
			min: 0,
			update: this.update.bind(this)
		});
		[this.addQuantityRow, this.addQuantity] = createFullwidthButton({
			text: 'Add new quantity',
			update: this.onClick.bind(this)
		});
		this.panel.add(this.geometryRow, this.traceRow, this.primariesRow, this.addQuantityRow);
	}

	setObject(object: ScoringOutput): void {
		super.setObject(object);
		if (!object) return;
		const { trace, primaries, children: quantities } = object;
		this.object = object;

		this.geometry.setOptions(this.editor.detectorManager.getDetectorOptions());
		this.geometry.setValue(object.geometry?.uuid);

		if (trace[0]) {
			const options = this.editor.scoringManager.getFilterOptions();
			hideUIElement(this.primariesRow);
			hideUIElement(this.addQuantityRow);
			if (Object.keys(options).length > 0) {
				showUIElement(this.traceFilter);
				this.traceFilter.setOptions(options);
				this.traceFilter.setValue(trace[1]);
			} else hideUIElement(this.traceFilter);
		} else {
			showUIElement(this.primariesRow);
			showUIElement(this.addQuantityRow);
			hideUIElement(this.traceFilter);
			if (quantities.length === 0) hideUIElement(this.primariesRow);
			else if (!primaries[0]) hideUIElement(this.primariesMultiplier);
			else if (!this.trace.getValue()) showUIElement(this.primariesMultiplier);
		}
		this.primaries.setValue(primaries[0]);
		if (primaries[1] !== null) this.primariesMultiplier.setValue(primaries[1]);
		this.trace.setValue(trace[0]);
	}

	onClick() {
		if (!this.object) return;
		this.editor.execute(new AddQuantityCommand(this.editor, this.object));
	}

	update(): void {
		if (!this.object) return;
		const primaries = new SetOutputSettingsCommand(
			this.editor,
			this.object,
			'primaries',
			this.trace.getValue()
				? [false, null]
				: [this.primaries.getValue(), this.primariesMultiplier.getValue()]
		);
		const trace = new SetOutputSettingsCommand(this.editor, this.object, 'trace', [
			this.trace.getValue(),
			this.traceFilter.getValue()
		]);
		const geometry = new SetOutputSettingsCommand(
			this.editor,
			this.object,
			'geometry',
			this.editor.detectorManager.getDetectorByUuid(this.geometry.getValue())
		);
		[primaries, trace, geometry].forEach(command => this.editor.execute(command));
	}
}
