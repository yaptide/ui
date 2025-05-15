import * as THREE from 'three';

import { OneSlotContainer } from '../../Simulation/Base/SimulationContainer';
import { SimulationElement } from '../../Simulation/Base/SimulationElement';
import { SimulationMesh } from '../../Simulation/Base/SimulationMesh';
import { SimulationZone } from '../../Simulation/Base/SimulationZone';
import { Detector } from '../../Simulation/Detectors/Detector';
import { ScoringFilter } from '../../Simulation/Scoring/ScoringFilter';
import { ScoringOutput } from '../../Simulation/Scoring/ScoringOutput';
import { ScoringQuantity } from '../../Simulation/Scoring/ScoringQuantity';
import { Command, CommandJSON } from '../Command';
import { YaptideEditor } from '../YaptideEditor.js';

interface MoveObjectInTreeCommandJSON extends CommandJSON {
	oldIndex: number;
	newIndex: number;
	oldParentUuid: string;
	newParentUuid: string;
	objectUuid: string;
	selectedUuid: string;
}

export class MoveObjectInTreeCommand extends Command {
	object: THREE.Object3D;
	oldParent: THREE.Object3D;
	newParent: THREE.Object3D;
	newIndex: number;
	oldIndex: number;
	oldSelect: THREE.Object3D | null;
	constructor(
		editor: YaptideEditor,
		object: THREE.Object3D,
		newIndex: number,
		newParent: THREE.Object3D | null
	) {
		super(editor);

		if (!object.parent) {
			throw new Error('The object does not have a parent.');
		}

		this.type = 'MoveObjectInTreeCommand';
		this.object = object;
		this.oldParent = object.parent;
		this.newParent = newParent ?? this.resolveBaseParent();

		this.newIndex = newIndex;

		if (this.newParent.children.length < this.newIndex) {
			throw new Error('The new index is not valid.');
		}

		this.oldIndex = this.oldParent.children.indexOf(object);

		if (this.oldIndex === -1) {
			throw new Error('The object is not a child of the given parent.');
		}

		this.oldSelect = editor.selected;
	}

	execute() {
		this.doExecute(this.newIndex, this.newParent, this.oldParent);
		this.editor.select(this.object);
	}

	undo() {
		this.doExecute(this.oldIndex, this.oldParent, this.newParent);
		this.editor.select(this.oldSelect);
	}

	private doExecute(newIndex: number, newParent: THREE.Object3D, oldParent: THREE.Object3D) {
		if (oldParent !== newParent) {
			newParent.attach(this.object);
		}

		let currentIndex = 0;

		for (let i = 0; i < newParent.children.length; i++) {
			if (newParent.children[i].uuid === this.object.uuid) {
				currentIndex = i;

				break;
			}
		}

		const element = newParent.children.splice(currentIndex, 1)[0];

		if (element !== this.object) {
			throw new Error('Object not in expected position.');
		}

		newParent.children.splice(newIndex, 0, this.object);

		this.editor.signals.objectChanged.dispatch(oldParent, 'children');

		if (oldParent !== newParent) {
			this.editor.signals.objectChanged.dispatch(newParent, 'children');
		}

		this.editor.signals.sceneGraphChanged.dispatch();
	}

	private resolveBaseParent(): THREE.Object3D {
		switch (true) {
			case this.object instanceof SimulationZone:
				return this.editor.zoneManager.zoneContainer;
			case this.object instanceof Detector:
				return this.editor.detectorManager.detectorContainer;
			case this.object instanceof ScoringFilter:
				return this.editor.scoringManager.filterContainer;
			case this.object instanceof ScoringOutput:
				return this.editor.scoringManager.outputContainer;
			case this.object instanceof SimulationMesh:
				return this.editor.figureManager.figureContainer;
			default:
				throw new Error('Invalid object');
		}
	}

	toSerialized() {
		const output: MoveObjectInTreeCommandJSON = {
			...super.toSerialized(),
			objectUuid: this.object.uuid,
			oldParentUuid: this.oldParent.uuid,
			newParentUuid: this.newParent.uuid,
			oldIndex: this.oldIndex,
			newIndex: this.newIndex,
			selectedUuid: this.editor.selected ? this.editor.selected.uuid : ''
		};

		return output;
	}

	fromSerialized(json: MoveObjectInTreeCommandJSON) {
		super.fromSerialized(json);

		const found = this.editor.objectByUuid(json.objectUuid);

		if (!found) {
			throw new Error('The object was not found in the scene.');
		}

		this.object = found;
		this.oldIndex = json.oldIndex;
		this.newIndex = json.newIndex;

		const oldParentSearch = this.editor.objectByUuid(json.oldParentUuid);

		if (!oldParentSearch) {
			throw new Error('The old parent object was not found in the scene.');
		}

		const newParentSearch = this.editor.objectByUuid(json.newParentUuid);

		if (!newParentSearch) {
			throw new Error('The new parent object was not found in the scene.');
		}

		this.oldParent = oldParentSearch;
		this.newParent = newParentSearch;

		this.oldSelect = this.editor.objectByUuid(json.selectedUuid) ?? null;
	}
}
