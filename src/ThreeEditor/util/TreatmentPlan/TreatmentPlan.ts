import { Signal } from 'signals';
import { Editor } from '../../js/Editor';
import { SimulationObject3D } from '../SimulationBase/SimulationMesh';
import { Patient } from './Patient';

export interface TreatmentPlanJSON {
	patientPath: string;
	beamPath: string;
}

const _default = {
	usePatient: false,
	patientPath: '',
	beamPath: ''
};

export class TreatmentPlan extends SimulationObject3D {
	readonly notRemovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;

	get notMovable() {
		return !this._usePatient;
	}

	readonly isTreatmentPlan: true = true;

	private _usePatient: boolean = _default.usePatient;
	private _proxy: TreatmentPlan;
	private _overrideHandler = {
		get: (target: TreatmentPlan, key: keyof TreatmentPlan) => {
			if (key === 'position') return target.patient.position;
			return Reflect.get(target, key);
		}
	};
	private signals: {
		patientUsageChanged: Signal<boolean>;
	};

	patientPath: string = _default.patientPath;
	beamPath: string = _default.beamPath;

	patient: Patient;

	constructor(editor: Editor) {
		super(editor, 'TreatmentPlan', 'TreatmentPlan');

		this.patient = new Patient(editor);
		this.signals = editor.signals;
		this.editor.sceneHelpers.add(this.patient);

		this._proxy = new Proxy(this, this._overrideHandler);
		return this._proxy;
	}

	set usePatient(value: boolean) {
		this._usePatient = value;
		this.patient.visible = value;
		this.signals.patientUsageChanged.dispatch(value);
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
			beamPath: this.beamPath
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
