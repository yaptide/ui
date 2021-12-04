import * as THREE from 'three';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	isBasicMesh,
	isBoxMesh,
	isCylinderMesh,
	isSphereMesh
} from '../../../util/BasicMeshes';
import { DetectFilter } from '../../../util/Detect/DetectFilter';
import { DetectGeometry, isDetectGeometry } from '../../../util/Detect/DetectGeometry';
import { FilterRule } from '../../../util/Detect/DetectRule';
import { DETECT_OPTIONS } from '../../../util/Detect/DetectTypes';
import {
	createRulesOutliner,
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
import { UIOutliner } from '../../libs/ui.three';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectFilter extends ObjectAbstract {
	object?: DetectFilter;
	rule?: FilterRule;
	outliner: UIOutliner;
	constructor(editor: Editor) {
		super(editor, 'Scoring rules');
		[this.outliner] = createRulesOutliner(editor, { update: this.update.bind(this) });
	}
	update(): void {
		const { object, rule } = this;
		if (!object) return;
		this.rule = object.getRuleByUuid(this.outliner.getValue());
		console.log(this.rule);
	}
}
