import { Signal } from 'signals';
import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { Detector, DetectorJSON, isDetector } from './Detector';
import { ScoringOutput, isOutput } from '../Scoring/ScoringOutput';

type DetectorManagerJSON = Omit<
	SimulationElementJSON & {
		detectors: DetectorJSON[];
		metadata: Record<string, string | number>;
	},
	never
>;

const detectorLoader = (editor: YaptideEditor) => (json: DetectorJSON) =>
	new Detector(editor).fromJSON(json);

export class DetectorContainer extends SimulationSceneContainer<Detector> {
	readonly isDetectContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Detectors', 'DetectorGroup', detectorLoader(editor));
	}
}

export class DetectorManager
	extends THREE.Scene
	implements SimulationPropertiesType, SimulationElementManager<'detector', Detector>
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.10`, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'DetectorManager.toJSON'
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {
		objectSelected: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		detectGeometryAdded: Signal<Detector>;
		detectGeometryRemoved: Signal<Detector>;
		detectGeometryChanged: Signal<Detector>;
		materialChanged: Signal<THREE.Material>;
	};
	private managerType: 'DetectorManager' = 'DetectorManager';
	private hasUsefulGeometry(object: THREE.Object3D): object is Detector | ScoringOutput {
		return Boolean(
			isDetector(object) ||
				(isOutput(object) &&
					this.editor.selected === object &&
					object.geometry &&
					object.geometry.boundingSphere &&
					object.geometry.boundingSphere.radius > 0)
		);
	}

	private _detectWireMaterial = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.5,
		wireframe: true,
		color: new THREE.Color('cyan')
	});
	private _name: string;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isDetectorManager: true = true;
	/***************************************************************/

	/************************DetectorMethods************************/
	detectorContainer: DetectorContainer;
	detectorHelper: THREE.Mesh;
	get detectors() {
		return this.detectorContainer.children;
	}

	addDetector(geometry: Detector): void {
		this.detectorContainer.add(geometry);
		this.editor.select(geometry);
		this.signals.detectGeometryAdded.dispatch(geometry);
	}
	removeDetector(geometry: Detector): void {
		this.detectorContainer.remove(geometry);
		this.editor.deselect();
		this.signals.detectGeometryRemoved.dispatch(geometry);
	}
	createDetector(): Detector {
		const geometry = new Detector(this.editor);
		this.addDetector(geometry);
		return geometry;
	}
	getDetectorByUuid(uuid: string): Detector | null {
		return this.detectors.find(child => child.uuid === uuid) as Detector | null;
	}
	getDetectorByName(name: string) {
		return this.detectors.find(child => child.name === name) as Detector | null;
	}
	getDetectorOptions(
		additionalPredicate?: (value: Detector, index: number, array: Detector[]) => boolean
	): Record<string, string> {
		const options = this.detectors
			.filter(({ detectorType: detectType, geometryParameters: geometryData }) => {
				if (detectType !== 'Zone') return true;
				return this.editor.zoneManager.getZoneByUuid(geometryData.zoneUuid) !== undefined;
			})
			.filter(additionalPredicate || (() => true))
			.reduce((acc, geometry) => {
				acc[geometry.uuid] = `${geometry.name} [${geometry.id}]`;
				return acc;
			}, {} as Record<string, string>);
		return options;
	}
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Detector Manager';

		this.detectorContainer = new DetectorContainer(editor);
		this.detectorHelper = new THREE.Mesh(undefined, this._detectWireMaterial);
		this.detectorHelper.visible = false;

		this.add(this.detectorContainer);
		this.add(this.detectorHelper);

		this.signals = editor.signals;
		this.signals.objectSelected.add(this.onObjectSelected.bind(this));
		this.signals.detectGeometryChanged.add(this.onObjectSelected.bind(this));
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private onObjectSelected = (object: THREE.Object3D) => {
		this.detectorHelper.geometry.dispose();
		this.detectorHelper.geometry = new THREE.BufferGeometry();
		this.detectorHelper.visible = false;

		if (!this.hasUsefulGeometry(object)) return;
		const selectionScope = isDetector(object) ? object : object.detector!;
		this.detectorHelper.position.copy(selectionScope.position);
		this._detectWireMaterial.color.copy(selectionScope.material.color);
		this.detectorHelper.geometry = selectionScope.geometry.clone();
		this.detectorHelper.visible = selectionScope.visible;

		this.signals.sceneGraphChanged.dispatch();
	};

	private onMaterialChanged() {
		if (isDetector(this.editor.selected)) {
			this._detectWireMaterial.color.copy(this.editor.selected.material.color);
		}
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);
		return this.fromJSON(source.toJSON());
	}

	reset() {
		this.name = this._name;
		this.detectorContainer.reset();

		this.detectorHelper.geometry.dispose();

		return this;
	}

	toJSON(): DetectorManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;
		return {
			uuid,
			name,
			type,
			metadata,
			detectors: this.detectorContainer.toJSON()
		};
	}

	fromJSON(json: DetectorManagerJSON) {
		const {
			metadata: { version }
		} = this;
		const { uuid, name, detectors, metadata } = json;
		if (!metadata || metadata.version !== version)
			console.warn(`DetectorManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;
		this.detectorContainer.fromJSON(detectors);
		return this;
	}
}

export const isDetectContainer = (x: unknown): x is DetectorContainer =>
	x instanceof DetectorContainer;

export const isDetectorManager = (x: unknown): x is DetectorManager => x instanceof DetectorManager;
