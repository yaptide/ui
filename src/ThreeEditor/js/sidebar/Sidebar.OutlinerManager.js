import { UIOutliner } from '../libs/ui.three.js';

const escapeHTML = html => {
	return html
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};

const getObjectType = object => {
	switch (object.type) {
		case 'Scene':
			return 'FigureGroup';
		case 'DetectGroup':
			return 'DetectGroup';
		case 'FilterGroup':
			return 'FilterGroup';
		case 'OutputGroup':
			return 'OutputGroup';
		case 'ZoneGroup':
			return 'ZoneGroup';
		case 'Zone':
		case 'WorldZone':
			return 'Zone';
		case 'Beam':
			return 'Beam';
		case 'BoxMesh':
		case 'CylinderMesh':
		case 'SphereMesh':
			return 'Figure';
		case 'Points':
		case 'Detect':
			return 'Detect';
		case 'Filter':
			return 'Filter';
		default:
			return 'Unknown';
	}
};
const getAditionalInfo = object => {
	switch (object.type) {
		case 'BoxMesh':
			return ` [${object.id}] <span class="type Geometry"></span> Box`;
		case 'CylinderMesh':
			return ` [${object.id}] <span class="type Geometry"></span> Cylinder`;
		case 'SphereMesh':
			return ` [${object.id}] <span class="type Geometry"></span> Sphere`;
		case 'Beam':
			return ` [${object.id}]`;
		case 'WorldZone':
			return `<span class="type Material"></span> 
            ${escapeHTML(object.simulationMaterial.name)}`;
		case 'Zone':
			return ` [${object.id}] <span class="type Material"></span> 
            ${escapeHTML(object.simulationMaterial.name)}`; //TODO: change to simulation material when its implemented
		case 'Points':
		case 'Detect':
			return ` [${object.id}] <span class="type Geometry"></span> 
            ${escapeHTML(object.detectType)}`;
		default:
			return '';
	}
};

const buildHTML = object => {
	let html =
		`<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name)}` +
		getAditionalInfo(object);
	return html;
};

const buildOptions = (object, pad) => {
	const option = document.createElement('div');
	option.draggable = false;
	option.innerHTML = buildHTML(object);
	option.value = object.uuid;
	option.style.paddingLeft = pad * 18 + 'px';
	let result = [option];
	if (object.type !== 'Beam' && object.children?.length > 0)
		//TODO: move beam helpers to scene helpers
		result = result.concat(object.children.flatMap(child => buildOptions(child, pad + 1)));
	return result;
};

export class OutlinerManager {
	editor;
	outliner;
	nodeStates; //TODO: copy collapsable groups system from THREE.js Editor
	ignoreObjectSelectedSignal = false;
	_selected;
	constructor(editor, container) {
		this.editor = editor;
		this.outliner = new UIOutliner(editor);
		this.nodeStates = new WeakMap();
		container.add(this.outliner);
		this.outliner.onChange(this.onChange.bind(this));
		this.editor.signals.objectSelected.add(this.onObjectSelected.bind(this));
		this.editor.signals.dataObjectSelected.add(this.onObjectSelected.bind(this));
		this.editor.signals.contextChanged.add(() => this.outliner.setValue(null));
	}
	setOptionsFromSources(sources) {
		const options = sources.flatMap(parent => buildOptions(parent, 0));
		this.outliner.setOptions(options);
		this.outliner.setValue(this._selected);
	}
	set id(id) {
		this.outliner.setId(id);
	}
	onChange() {
		const selectedUuid = this.outliner.getValue();
		this._selected = this.outliner.selectedValue;
		this.ignoreObjectSelectedSignal = true;
		this.editor.selectByUuid(selectedUuid);
		this.ignoreObjectSelectedSignal = false;
	}
	onObjectSelected(object) {
		if (this.ignoreObjectSelectedSignal) return;
		this._selected = object?.uuid ?? null;
		this.outliner.setValue(object?.uuid ?? null);
	}
}
