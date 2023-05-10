import { Signal } from 'signals';
import * as THREE from 'three';
import { Color, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { debounce } from 'throttle-debounce';
import { Editor } from '../../../js/Editor';
import {
	AdditionalGeometryDataType,
	generateSimulationInfo
} from '../../../../util/AdditionalGeometryData';
import { SimulationElement } from '../../Base/SimElement';
import { WorldZoneHelper } from './WorldZoneHelper';
import SimulationMaterial from '../../Materials/SimulationMaterial';

export const BOUNDING_ZONE_TYPE = ['Sphere', 'Cylinder', 'Box'] as const;

export type WorldZoneType = (typeof BOUNDING_ZONE_TYPE)[number];

export interface WorldZoneJSON {
	uuid: string;
	type: string;
	center: THREE.Vector3;
	size: THREE.Vector3;
	geometryType: WorldZoneType;
	name: string;
	marginMultiplier: number;
	autoCalculate: boolean;
	materialUuid: string;
	geometryData?: AdditionalGeometryDataType;
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
	readonly notVisibleChildren: boolean = true;
	readonly notDraggable: boolean = true;

	editor: Editor;

	private _material: MeshBasicMaterial;
	private _simulationMaterial: SimulationMaterial;

	readonly isWorldZone: true = true;

	private _autoCalculate: boolean;
	private _geometryType: WorldZoneType = 'Box';
	private _helper!: WorldZoneHelper;
	public get helperMesh(): THREE.Mesh {
		return this._helper.getMeshType(this.geometryType);
	}
	helperProxy!: WorldZoneHelper;

	private _handleHelperUpdate = {
		get: (target: WorldZoneHelper, prop: keyof WorldZoneHelper) => {
			switch (prop) {
				case 'reset':
				case 'updateHelper':
				case 'calculateFromObject':
					this.updatePosition();
					this.signals.objectChanged.dispatch(this);
			}
			return Reflect.get(target, prop);
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

	constructor(editor: Editor) {
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
		this.geometryType = 'Box';

		editor.sceneHelpers.add(this.helper);

		const handleSignal = (object: Object3D) => {
			if (this.autoCalculate && !isWorldZone(object)) this.debouncedCalculate();
			else if (object === this) {
				this._helper.getMeshType(this.geometryType).visible = object.visible;
				this.signals.objectChanged.dispatch(this._helper.getMeshType(this.geometryType));
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
		return this._geometryType === 'Box';
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
		this.simulationMaterial = this.editor.materialManager.defaultMaterial;
		this.geometryType = 'Box';
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
		const geometryData = generateSimulationInfo(this.helper.getMeshType(this.geometryType));
		geometryData.position = this.position.toArray();
		const jsonObject: WorldZoneJSON = {
			uuid: this.uuid,
			center: this.center,
			size: this.size,
			type: this.type,
			geometryType: this.geometryType,
			name: this.name,
			marginMultiplier: this.helper.marginMultiplier,
			autoCalculate: this.autoCalculate,
			materialUuid,
			geometryData
		};

		return jsonObject;
	}

	fromJSON(data: WorldZoneJSON) {
		this.geometryType = data.geometryType;
		this.name = data.name;
		this.helper.marginMultiplier = data.marginMultiplier;
		this.helper.updateHelper(data.center, data.size);
		this.position.copy(data.center);

		this.autoCalculate = data.autoCalculate;
		this.simulationMaterial =
			this.editor.materialManager.getMaterialByUuid(data.materialUuid) ??
			this.editor.materialManager.defaultMaterial;

		return this;
	}

	static fromJSON(editor: Editor, data: WorldZoneJSON) {
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
