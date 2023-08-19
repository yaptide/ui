import { Signal } from 'signals';
import * as THREE from 'three';
import { Color, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';

import {
	AdditionalGeometryDataType,
	getGeometryData
} from '../../../../util/AdditionalGeometryData';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationElement } from '../../Base/SimulationElement';
import SimulationMaterial from '../../Materials/SimulationMaterial';
import { WorldZoneHelper } from './WorldZoneHelper';

export const BOUNDING_ZONE_TYPE = [
	'SphereGeometry',
	'HollowCylinderGeometry',
	'BoxGeometry'
] as const;

export type WorldZoneType = (typeof BOUNDING_ZONE_TYPE)[number];

export interface WorldZoneJSON {
	uuid: string;
	type: string;
	name: string;
	marginMultiplier: number;
	autoCalculate: boolean;
	materialUuid: string;
	geometryData: AdditionalGeometryDataType;
	visible: boolean;
}

const _materialDefault = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

const _defaultColor = 0xff0000;

export class WorldZone extends SimulationElement {
	readonly notRemovable: boolean = true;
	get notMovable() {
		// custom get function to conditionally return notMoveable property;
		return this.autoCalculate && this.canCalculate();
	}

	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notVisibleChildren = true;
	readonly notDraggable = true;
	readonly notDuplicatable = true;

	editor: YaptideEditor;

	private _material: MeshBasicMaterial;
	private _simulationMaterial: SimulationMaterial;

	readonly isWorldZone: true = true;

	private _autoCalculate: boolean;
	private _geometryType: WorldZoneType = 'BoxGeometry';
	private _helper!: WorldZoneHelper;
	public get helperMesh(): THREE.Mesh {
		return this._helper.getMeshByType(this.geometryType);
	}

	helperProxy!: WorldZoneHelper;

	private _handleHelperUpdate: ProxyHandler<WorldZoneHelper> = {
		apply: (target: WorldZoneHelper, thisArg: keyof WorldZoneHelper, args: any[]) => {
			const result = Reflect.apply(target[thisArg] as Function, target, args);

			switch (thisArg) {
				case 'reset':
				case 'updateHelper':
				case 'calculateFromObject':
					this.updatePosition();
					this.signals.objectChanged.dispatch(this);
			}

			return result;
		}
	};

	public set helper(value: WorldZoneHelper) {
		this._helper = value;
		this.helperProxy = new Proxy(this._helper, this._handleHelperUpdate);
	}

	public get helper(): WorldZoneHelper {
		return this.helperProxy;
	}

	private signals: {
		objectChanged: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		objectSelected: Signal<THREE.Object3D>;
		autocalculateChanged: Signal<boolean>;
	};

	readonly debouncedCalculate = debounce(200, () => this.calculate(), { atBegin: false });

	constructor(editor: YaptideEditor) {
		super(editor, 'World Zone', 'WorldZone');
		this.name = 'World Zone';
		this._material = _materialDefault;
		this._autoCalculate = false;
		this.editor = editor;
		this.signals = editor.signals;

		this._simulationMaterial = editor.materialManager.defaultMaterial;
		this._simulationMaterial.increment();

		// watch for changes on material color
		const materialColorHandler = {
			get: (target: Color, prop: keyof Color) => {
				const result = Reflect.get(this.simulationMaterial.color, prop);

				return result;
			}
		};

		const proxyColor = new Proxy(new Color(_defaultColor), materialColorHandler);
		this._material.color = proxyColor;

		this.helper = new WorldZoneHelper(editor, this._material);
		this.geometryType = 'BoxGeometry';

		editor.sceneHelpers.add(this.helper);

		const handleSignal = (object: Object3D) => {
			if (this.autoCalculate && !isWorldZone(object)) this.debouncedCalculate();
			else if (object === this) {
				this._helper.getMeshByType(this.geometryType).visible = object.visible;
				this.signals.objectChanged.dispatch(this._helper.getMeshByType(this.geometryType));
			}
		};
		this.signals.objectChanged.add(handleSignal);
		this.signals.sceneGraphChanged.add(handleSignal);
	}

	get material(): MeshBasicMaterial {
		return this._simulationMaterial;
	}

	get simulationMaterial(): SimulationMaterial {
		return this._simulationMaterial;
	}

	set simulationMaterial(value: SimulationMaterial) {
		this._simulationMaterial.decrement();
		this._simulationMaterial = value;
		this._material.color.setHex(value.color.getHex());
		this._simulationMaterial.increment();
	}

	get geometry() {
		return this.helperMesh.geometry;
	}

	get geometryType() {
		return this._geometryType;
	}

	set geometryType(value: WorldZoneType) {
		this._geometryType = value;
		this.helper.geometryType = value;
	}

	get autoCalculate(): boolean {
		return this._autoCalculate;
	}

	set autoCalculate(value: boolean) {
		this._autoCalculate = value;

		if (this._autoCalculate) this.calculate();
		this.signals.autocalculateChanged.dispatch(value);
	}

	get center() {
		return this._helper.center;
	}

	set center(value: Vector3) {
		this._helper.updateHelper(value, this.size);
		this.position.copy(value);
	}

	get size() {
		return this._helper.size;
	}

	set size(value: Vector3) {
		this._helper.updateHelper(this.center, value);
	}

	canCalculate(): boolean {
		return this._geometryType === 'BoxGeometry';
	}

	calculate(): void {
		if (!this.canCalculate()) return;

		const object = this.editor.zoneManager.zoneContainer;
		this.helper.calculateFromObject(object);
		this.editor.signals.objectChanged.dispatch(this, 'size');
	}

	updatePosition(): void {
		this.position.copy(this.center);
	}

	reset(): void {
		this.debouncedCalculate.cancel();

		this._material.color.set(_defaultColor);
		this.name = 'World Zone';
		this._simulationMaterial = this.editor.materialManager.defaultMaterial;
		this.geometryType = 'BoxGeometry';
		this.helper.reset();
	}

	addHelpersToSceneHelpers(): void {
		this.editor.sceneHelpers.add(this._helper);
	}

	removeHelpersFromSceneHelpers(): void {
		this.editor.sceneHelpers.remove(this._helper);
	}

	toJSON() {
		const { uuid: materialUuid } = this.simulationMaterial;
		const geometryData = getGeometryData(this.helper.getMeshByType(this.geometryType));
		geometryData.position = this.position.toArray();
		const jsonObject: WorldZoneJSON = {
			uuid: this.uuid,
			type: this.type,
			name: this.name,
			marginMultiplier: this.helper.marginMultiplier,
			autoCalculate: this.autoCalculate,
			materialUuid,
			visible: this.visible,
			geometryData
		};

		return jsonObject;
	}

	fromJSON(data: WorldZoneJSON) {
		const {
			geometryData: { position, parameters, geometryType },
			name,
			marginMultiplier,
			autoCalculate,
			materialUuid,
			visible
		} = data;
		const center = new Vector3().fromArray(position);
		const { width, height, depth, radius } = parameters as Record<string, number>;
		const size = new Vector3(width ?? radius, height ?? radius, depth ?? radius);
		this.geometryType = geometryType as WorldZoneType;
		this.name = name;
		this.helper.marginMultiplier = marginMultiplier;
		this.helper.updateHelper(center, size);
		this.position.copy(center);

		this.autoCalculate = autoCalculate;
		this.simulationMaterial =
			this.editor.materialManager.getMaterialByUuid(materialUuid) ??
			this.editor.materialManager.defaultMaterial;

		this.visible = visible;
		this._helper.getMeshByType(this.geometryType).visible = visible;

		return this;
	}

	static fromJSON(editor: YaptideEditor, data: WorldZoneJSON) {
		return new WorldZone(editor).fromJSON(data);
	}

	copy(source: this, recursive = true) {
		super.copy(source, recursive);

		return this;
	}

	clone(recursive: boolean) {
		return new WorldZone(this.editor).copy(this, recursive) as this;
	}
}

export const isWorldZone = (x: unknown): x is WorldZone => x instanceof WorldZone;
