import * as THREE from 'three';

const materialClasses = {
	LineBasicMaterial: THREE.LineBasicMaterial,
	LineDashedMaterial: THREE.LineDashedMaterial,
	MeshBasicMaterial: THREE.MeshBasicMaterial,
	MeshDepthMaterial: THREE.MeshDepthMaterial,
	MeshNormalMaterial: THREE.MeshNormalMaterial,
	MeshLambertMaterial: THREE.MeshLambertMaterial,
	MeshMatcapMaterial: THREE.MeshMatcapMaterial,
	MeshPhongMaterial: THREE.MeshPhongMaterial,
	MeshToonMaterial: THREE.MeshToonMaterial,
	MeshStandardMaterial: THREE.MeshStandardMaterial,
	MeshPhysicalMaterial: THREE.MeshPhysicalMaterial,
	RawShaderMaterial: THREE.RawShaderMaterial,
	ShaderMaterial: THREE.ShaderMaterial,
	ShadowMaterial: THREE.ShadowMaterial,
	SpriteMaterial: THREE.SpriteMaterial,
	PointsMaterial: THREE.PointsMaterial
};

const vertexShaderVariables = [
	'uniform mat4 projectionMatrix;',
	'uniform mat4 modelViewMatrix;\n',
	'attribute vec3 position;\n\n'
].join('\n');

const meshMaterialOptions = {
	MeshBasicMaterial: 'MeshBasicMaterial',
	MeshDepthMaterial: 'MeshDepthMaterial',
	MeshNormalMaterial: 'MeshNormalMaterial',
	MeshLambertMaterial: 'MeshLambertMaterial',
	MeshMatcapMaterial: 'MeshMatcapMaterial',
	MeshPhongMaterial: 'MeshPhongMaterial',
	MeshToonMaterial: 'MeshToonMaterial',
	MeshStandardMaterial: 'MeshStandardMaterial',
	MeshPhysicalMaterial: 'MeshPhysicalMaterial',
	RawShaderMaterial: 'RawShaderMaterial',
	ShaderMaterial: 'ShaderMaterial',
	ShadowMaterial: 'ShadowMaterial'
};

const lineMaterialOptions = {
	LineBasicMaterial: 'LineBasicMaterial',
	LineDashedMaterial: 'LineDashedMaterial',
	RawShaderMaterial: 'RawShaderMaterial',
	ShaderMaterial: 'ShaderMaterial'
};

const spriteMaterialOptions = {
	SpriteMaterial: 'SpriteMaterial',
	RawShaderMaterial: 'RawShaderMaterial',
	ShaderMaterial: 'ShaderMaterial'
};

const pointsMaterialOptions = {
	PointsMaterial: 'PointsMaterial',
	RawShaderMaterial: 'RawShaderMaterial',
	ShaderMaterial: 'ShaderMaterial'
};

export {
	materialClasses,
	vertexShaderVariables,
	meshMaterialOptions,
	lineMaterialOptions,
	spriteMaterialOptions,
	pointsMaterialOptions
};
