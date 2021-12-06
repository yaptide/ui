import { UIOutliner } from '../libs/ui.three.js';
import { escapeHTML } from '../../util/escapeHTML.js';
import { UICheckbox } from '../libs/ui.js';
import { SetValueCommand } from '../commands/SetValueCommand.js';

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
			return 'Detect';
		case 'Filter':
			return 'Filter';
		default:
			console.warn(`could not parse object of type ${object.type}`, typeof object, object);
			return 'Unknown';
	}
};
const getAdditionalInfo = object => {
	switch (object.type) {
		case 'BoxMesh':
			return ` [${object.id}] <span class="type Geometry"></span>  <span class="type-value">Box</span>`;
		case 'CylinderMesh':
			return ` [${object.id}] <span class="type Geometry"></span> <span class="type-value"> Cylinder</span>`;
		case 'SphereMesh':
			return ` [${object.id}] <span class="type Geometry"></span> <span class="type-value"> Sphere</span>`;
		case 'Beam':
			return ` [${object.id}]`;
		case 'WorldZone':
		case 'Zone':
			return `<span class="type Material"></span> 
            <span class="type-value">${escapeHTML(object.simulationMaterial.name)}</span>`;
		case 'Points':
		case 'Detect':
			return ` [${object.id}] <span class="type Geometry"></span> 
			<span class="type-value">${escapeHTML(object.detectType)}</span>`;
		default:
			return '';
	}
};

const buildHTML = object => {
	let html =
		`<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name)}` +
		getAdditionalInfo(object);

	return html;
};

const buildOptions = (editor, object, pad) => {
	const option = document.createElement('div');
	option.style.display = 'flex';
	option.draggable = false;
	option.innerHTML = buildHTML(object);
	option.value = object.uuid;
	option.style.paddingLeft = pad * 18 + 'px';

	if ('visible' in object) {
		const visible = new UICheckbox(object.visible);
		visible.setStyle('margin', ['0']);
		visible.setStyle('margin-left', ['auto']);
		visible.dom.title = 'visible';
		visible.dom.disabled = object?.parent?.visible === false ? 'disabled' : '';
		visible.onClick(e => e.stopPropagation());
		visible.onChange(() => {
			editor.execute(new SetValueCommand(editor, object, 'visible', visible.getValue()));
		});
		option.appendChild(visible.dom);
	}

	let result = [option];
	if (object.type !== 'Beam' && object.children?.length > 0)
		//TODO: move beam helpers to scene helpers
		result = result.concat(
			object.children.flatMap(child => buildOptions(editor, child, pad + 1))
		);
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
		const options = sources.flatMap(parent => buildOptions(this.editor, parent, 0));
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
