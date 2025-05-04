import * as THREE from 'three';

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
		this.newParent = newParent ?? editor.figureManager.figureContainer;

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
		this.doExecute(this.newIndex, this.oldIndex, this.newParent, this.oldParent);
		this.editor.select(this.object);
	}

	undo() {
		this.doExecute(this.oldIndex, this.newIndex, this.oldParent, this.newParent);
		this.editor.select(this.oldSelect);
	}

	private doExecute(
		newIndex: number,
		oldIndex: number,
		newParent: THREE.Object3D,
		oldParent: THREE.Object3D
	) {
		if (
			!this.editor.objectByUuid(newParent.uuid) ||
			!this.editor.objectByUuid(oldParent.uuid)
		) {
			throw new Error('Object parents reference invalid.');
		}

		if (oldParent !== newParent) {
			newParent.attach(this.object);
		}

		// for (const i in newParent.children) {
		// 	if (newParent.children[i].uuid === this.object.uuid) {
		// 		oldIndex = i;
		// 		break;
		// 	}
		// }
		//
		// const element = oldParent.children.splice(oldIndex, 1)[0];
		//
		// if (element !== this.object) {
		// 	throw new Error('Object not in expected position.');
		// }
		//
		// newParent.children.splice(newIndex, 0, this.object);

		this.editor.signals.objectChanged.dispatch(oldParent, 'children');

		if (oldParent !== newParent) {
			this.editor.signals.objectChanged.dispatch(newParent, 'children');
		}

		this.editor.signals.sceneGraphChanged.dispatch();
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
