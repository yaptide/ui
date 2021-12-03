import * as THREE from 'three';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	isBasicMesh,
	isBoxMesh,
	isCylinderMesh,
	isSphereMesh
} from '../../../util/BasicMeshes';
import { DetectGeometry, isDetectGeometry } from '../../../util/Detect/DetectGeometry';
import { DETECT_OPTIONS } from '../../../util/Detect/DetectTypes';
import {
	createRowParamNumber,
	createRowSelect,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import { isWorldZone, WorldZone } from '../../../util/WorldZone';
import {
	SetDetectGeometryCommand,
	SetDetectTypeCommand,
	SetGeometryCommand,
	SetValueCommand
} from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UINumber, UIRow, UISelect, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectFilter extends ObjectAbstract {
	constructor(editor: Editor) {
		super(editor, 'Rules');
	}
	update(): void {
		throw new Error('Method not implemented.');
	}
}
