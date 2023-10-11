import * as THREE from 'three';

import { isCounterMapError } from '../../../util/CounterMap/CounterMap';
import { YaptideEditor } from '../../js/YaptideEditor.js';
import { Icru } from './MaterialManager';
import {
	DEFAULT_MATERIAL_DENSITY,
	DEFAULT_MATERIAL_ICRU,
	DEFAULT_MATERIAL_NAME,
	DEFAULT_SANITIZED_MATERIAL_NAME
} from './materials';

export type RenderProps = Omit<
	SimulationMaterialJSON,
	'uuid' | 'name' | 'icru' | 'density' | 'sanitizedName'
>;

export type SimulationMaterialJSON = {
	uuid: string;
	name: string;
	sanitizedName: string;
	icru: Icru;
	density: number;
	customStoppingPower?: boolean;
	transparent?: boolean;
	opacity?: number;
	color?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
};
export default class SimulationMaterial extends THREE.MeshPhongMaterial {
	private proxy: SimulationMaterial;
	private editor: YaptideEditor;
	private colorProxy: THREE.Color;
	icru: Icru;
	sanitizedName: string;
	density: number;
	customStoppingPower: boolean = false;
	renderProps: RenderProps;
	defaultProps: RenderProps;
	readonly isSimulationMaterial: true = true;
	private overrideHandler = {
		set: (target: SimulationMaterial, key: keyof RenderProps, value: unknown) => {
			const result = Reflect.set(target, key, value);

			if (
				['transparent', 'opacity', 'color', 'wireframe', 'wireframeLinewidth'].includes(key)
			)
				if (this.defaultProps[key] !== value) Reflect.set(this.renderProps, key, value);
				else delete this.renderProps[key];

			return result;
		},
		get: (target: SimulationMaterial, key: keyof RenderProps) => {
			const result = Reflect.get(target, key);

			if (key === 'color') return this.colorProxy;

			return result;
		}
	};

	private materialColorHandler = {
		get: (target: THREE.Color, prop: keyof THREE.Color) => {
			const result = Reflect.get(target, prop);
			const setHex = (hex: number) => {
				if (this.defaultProps.color !== hex) this.renderProps.color = hex;
				else delete this.renderProps.color;

				return target.setHex(hex);
			};

			if (prop === 'setHex') return setHex.bind(this);

			return result;
		}
	};

	constructor(
		editor: YaptideEditor,
		name: string = DEFAULT_MATERIAL_NAME,
		sanitizedName: string = DEFAULT_SANITIZED_MATERIAL_NAME,
		icru: number = DEFAULT_MATERIAL_ICRU,
		density: number = DEFAULT_MATERIAL_DENSITY
	) {
		super({
			name,
			flatShading: true,
			side: THREE.DoubleSide,
			transparent: false,
			color: new THREE.Color(0xff3d3d)
		});
		this.sanitizedName = sanitizedName;
		this.colorProxy = new Proxy(new THREE.Color(0xff3d3d), this.materialColorHandler);
		this.editor = editor;
		this.icru = icru;
		this.density = density;
		this.renderProps = {};
		this.proxy = new Proxy(this, this.overrideHandler);
		this.defaultProps = {
			transparent: false,
			opacity: 1,
			color: 0xff3d3d,
			wireframe: false,
			wireframeLinewidth: 1
		};

		return this.proxy;
	}

	toJSON(): SimulationMaterialJSON {
		const { uuid, name, sanitizedName, icru, density, renderProps, customStoppingPower } = this;

		return {
			uuid,
			sanitizedName,
			name,
			icru,
			density,
			...(customStoppingPower && { customStoppingPower }),
			...renderProps
		};
	}

	static fromJSON(
		editor: YaptideEditor,
		{
			uuid,
			name,
			sanitizedName,
			icru,
			density,
			customStoppingPower,
			...renderProps
		}: SimulationMaterialJSON
	): SimulationMaterial {
		const material = new SimulationMaterial(editor, name, sanitizedName, icru, density);
		material.uuid = uuid;
		material.customStoppingPower = customStoppingPower ?? false;
		material.renderProps = renderProps;
		material.applyRenderProps();

		return material.proxy;
	}

	applyRenderProps() {
		const { color, opacity, transparent, wireframe, wireframeLinewidth } = this.renderProps;

		if (color) this.colorProxy = new Proxy(new THREE.Color(color), this.materialColorHandler);
		if (opacity !== undefined) this.opacity = opacity;
		if (transparent !== undefined) this.transparent = transparent;
		if (wireframe !== undefined) this.wireframe = wireframe;
		if (wireframeLinewidth !== undefined) this.wireframeLinewidth = wireframeLinewidth;
	}

	copy(source: SimulationMaterial): this {
		const result = super.copy(source);
		result.sanitizedName = source.sanitizedName;
		result.renderProps = { ...source.renderProps };
		result.density = source.density;
		result.icru = source.icru;
		result.customStoppingPower = source.customStoppingPower;

		return new Proxy(result, this.overrideHandler) as this;
	}

	clone(): this {
		const result = new SimulationMaterial(this.editor).copy(this) as this;

		return result;
	}

	increment = () => this.editor.materialManager.selectedMaterials.increment(this.uuid);
	decrement = () => {
		try {
			this.editor.materialManager.selectedMaterials.decrement(this.uuid);
		} catch (e: unknown) {
			if (isCounterMapError(e)) console.error(e.message);
			else throw e;
		}
	};
}

export const isSimulationMaterial = (m: unknown): m is SimulationMaterial =>
	m instanceof SimulationMaterial;
