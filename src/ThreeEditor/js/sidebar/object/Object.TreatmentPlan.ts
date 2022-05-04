import { TreatmentPlan } from '../../../util/TreatmentPlan';
import { createRowCheckbox, createRowParamInput, hideUIElement, showUIElement } from '../../../util/Ui/Uis';
import { SetValueCommand } from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UICheckbox, UIInput, UIRow } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectTreatmentPlan extends ObjectAbstract {
	object?: TreatmentPlan;

	beamFileRow: UIRow;
	beamFile: UIInput;

	usePatientRow: UIRow;
	usePatient: UICheckbox;

	patientFileRow: UIRow;
	patientFile: UIInput;

	constructor(editor: Editor) {
		super(editor, 'Treatment Plan');
		[this.beamFileRow, this.beamFile] = createRowParamInput({
			text: 'Beam File',
			update: () => {
				this.editor.execute(
					new SetValueCommand(this.editor, this.object, 'beamPath', this.beamFile.getValue())
				);
			}
		});

		[this.usePatientRow, this.usePatient] = createRowCheckbox({
			text: 'Use Patient',
			update: () => {
				(this.usePatient.getValue() ? showUIElement : hideUIElement)(this.patientFileRow);
				this.editor.execute(
					new SetValueCommand(this.editor, this.object, 'usePatient', this.usePatient.getValue())
				);
			}
		});

		[this.patientFileRow, this.patientFile] = createRowParamInput({
			text: 'Patient File',
			update: () => {
				this.editor.execute(
					new SetValueCommand(this.editor, this.object, 'patientPath', this.patientFile.getValue())
				);
			}
		});
		this.panel.add(this.beamFileRow, this.usePatientRow, this.patientFileRow);
	}

	setObject(object: TreatmentPlan): void {
		super.setObject(object);
		if (!this.object) return;

		this.beamFile.setValue(this.object.beamPath);
		this.usePatient.setValue(this.object.usePatient);
		this.patientFile.setValue(this.object.patientPath);

		(this.usePatient.getValue() ? showUIElement : hideUIElement)(this.patientFileRow);
	}

	update(): void {

	}
}
