import { Editor } from '../js/Editor';
import { Patient } from './Patient/Patient';
import { SimulationObject3D } from './SimulationBase/SimulationMesh';

export interface TreatmentPlanJSON {
	patientPath: string,
	beamPath: string
}

const _default = {
	usePatient: false,
	patientPath: '',
	beamPath: '',
};

export class TreatmentPlan extends SimulationObject3D {
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	readonly isTreatmentPlan: true = true;

	private _usePatient: boolean = _default.usePatient;
	patientPath: string = _default.patientPath;
	beamPath: string = _default.beamPath;

	patient: Patient;

	constructor(editor: Editor) {
		super(editor, 'TreatmentPlan', 'TreatmentPlan');
		this.patient = new Patient(editor);
		this.editor.sceneHelpers.add(this.patient);
	}

	set usePatient(value: boolean) {
		this._usePatient = value;
		this.patient.visible = value;
	}

	get usePatient(): boolean {
		return this._usePatient;
	}

	reset(): void {
		this.usePatient = _default.usePatient;
		this.patientPath = _default.patientPath;
		this.beamPath = _default.beamPath;
	}

	toJSON() {
		const jsonObject: TreatmentPlanJSON = {
			patientPath: this.usePatient ? this.patientPath : '',
			beamPath: this.beamPath,
		};

		return jsonObject;
	}

	fromJSON(data?: TreatmentPlanJSON) {
		if (data) {
			this.usePatient = !!data.patientPath;
			this.patientPath = data.patientPath;
			this.beamPath = data.beamPath;
		}
		return this;
	}

	static fromJSON(editor: Editor, data: TreatmentPlanJSON) {
		return new TreatmentPlan(editor).fromJSON(data);
	}
}

export const isTreatmentPlan = (x: unknown): x is TreatmentPlan => x instanceof TreatmentPlan;
