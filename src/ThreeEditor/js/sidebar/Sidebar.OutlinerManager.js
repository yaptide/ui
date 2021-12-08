import { UIOutliner } from '../libs/ui.three.js';
import { escapeHTML } from '../../util/escapeHTML.js';

const getObjectType = object => {
	switch (object.type) {
		case 'Scene':
		case 'BoxMesh':
		case 'CylinderMesh':
		case 'SphereMesh':
			return 'Figure';
		case 'DetectGroup':
		case 'Points':
			return 'Detect';
		case 'Filter':
		case 'FilterGroup':
			return 'Filter';
		case 'OutputGroup':
		case 'Output':
		case 'Quantity':
			return 'Output';
		case 'ZoneGroup':
		case 'Zone':
		case 'WorldZone':
			return 'Zone';
		case 'Beam':
			return 'Beam';
		default:
			console.warn(`could not parse object of type ${object.type}`, typeof object, object);
			return 'Unknown';
	}
};
const getAditionalInfo = object => {
	switch (object.type) {
		case 'BoxMesh':
		case 'CylinderMesh':
		case 'SphereMesh':
			return ` [${object.id}] <span class="type Geometry"></span> ${object.type.slice(
				0,
				-4
			)}`;
		case 'Beam':
			let particle = object.particle;
			return ` [${object.id}] <span class="type Particle Beam"></span> ${particle.name} [${particle.id}]`;
		case 'WorldZone':
			let { simulationMaterial: worldMaterial } = object;
			return `<span class="type Material"></span> 
            ${escapeHTML(worldMaterial.name)}`;
		case 'Zone':
			let { simulationMaterial: material } = object;
			return ` [${object.id}] <span class="type Material"></span> 
            ${escapeHTML(material.name)}`;
		case 'Points':
			let { zone, detectType } = object;
			return ` [${object.id}] <span class="type Geometry ${
				detectType === 'Zone' ? 'Zone' : ''
			}"></span> ${escapeHTML(zone ? `${zone.name} [${zone.id}]` : detectType)}`;
		case 'Filter':
			return ` [${object.id}]`;
		case 'Output':
			let { geometry } = object;
			return ` [${object.id}] ${
				object.geometry
					? `<span class="type Detect Geometry"></span> ${escapeHTML(geometry.name)} [${
							geometry.id
					  }]`
					: ''
			}`;
		case 'Quantity':
			let filter = object.filter;
			return ` [${object.id}] ${
				filter
					? `<span class="type Filter Material"></span> ${escapeHTML(filter.name)} [${
							filter.id
					  }]`
					: ''
			}`;
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
