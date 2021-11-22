
import { UIOutliner } from '../libs/ui.three.js';

const escapeHTML = (html) => {
    return html
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const getObjectType = (object) => {
    switch (object.type) {
        case 'Scene': return 'Scene';
        case 'DetectGroup': return 'DetectGroup';
        case 'FilterGroup': return 'FilterGroup';
        case 'OutputGroup': return 'OutputGroup';
        case 'ZoneGroup': return 'ZoneGroup';
        case 'Zone':
        case 'WorldZone': return 'Zone';
        case 'Beam': return 'Beam';
        case 'BoxMesh':
        case 'CylinderMesh':
        case 'SphereMesh': return 'Figure';
        case 'Detect': return 'Detect';
        case 'Filter': return 'Filter';
    }
}
const getAditionalInfo = (object) => {
    switch (object.type) {
        case 'BoxMesh': return ['Geometry', 'Box'];
        case 'CylinderMesh': return ['Geometry', 'Cylinder'];
        case 'SphereMesh': return ['Geometry', 'Sphere'];
        case 'WorldZone':
        case 'Zone': return ['Material', object.material.name];
        case 'Detect': return ['Geometry', object.detectType];
        default: return ['', ''];
    }
}

const buildHTML = (object) => {
    let html = `<span class="type ${getObjectType(object)}"></span> ${escapeHTML(object.name)}`;
    let aditionalInfo = getAditionalInfo(object);

    html += ` <span class="type ${escapeHTML(aditionalInfo[0])}"></span> ${escapeHTML(aditionalInfo[1])}`;
    return html;
}

const buildOptions = (object, pad) => {
    const option = document.createElement('div');
    option.draggable = false;
    option.innerHTML = buildHTML(object);
    option.value = object.uuid;
    option.style.paddingLeft = pad * 18 + 'px';
    console.log(object, option);
    let result = [option];
    if (object.children.length > 0)
        result = result.concat(object.children.flatMap(child => buildOptions(child, pad + 1)));
    return result;
}

export class OutlinerManager {
    editor;
    outliner;
    nodeStates;
    constructor(editor, container) {
        this.editor = editor;
        this.outliner = new UIOutliner(editor);
        this.nodeStates = new WeakMap();
        container.add(this.outliner);
    }
    setOptionsFromSources(sources) {
        const options = sources.flatMap((parent) => buildOptions(parent, 0));
        console.log(options);
        this.outliner.setOptions(options);
    }
    set id(id) {
        this.outliner.setId(id);
    }
}