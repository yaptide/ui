import { UIOutliner } from '../libs/ui.three.js';
import { escapeHTML } from '../../../util/escapeHTML';
import { UICheckbox } from '../libs/ui.js';
import { SetValueCommand } from '../commands/SetValueCommand.js';

const getObjectType = object => {
   switch (object.type) {
      case 'Scene':
      case 'BoxFigure':
      case 'CylinderFigure':
      case 'SphereFigure':
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
const getAdditionalInfo = object => {
   switch (object.type) {
      case 'BoxFigure':
      case 'CylinderFigure':
      case 'SphereFigure':
         return ` [${object.id
            }] <span class="type Geometry"></span> <span class="type-value">${object.type.slice(
               0,
               -4
            )}</span>`;
      case 'Beam':
         let particle = object.particle;
         return ` [${object.id}] <span class="type Particle Beam"></span> ${particle.name} [${particle.id}]`;
      case 'WorldZone':
         let { simulationMaterial: worldMaterial } = object;
         return `<span class="type Material"></span> 
            <span class="type-value">${worldMaterial.name} [${worldMaterial.icru}]</span>`;
      case 'Zone':
         let { simulationMaterial: material } = object;
         return ` [${object.id}] <span class="type Material"></span> 
            <span class="type-value">${material.name} [${material.icru}]</span>`;
      case 'Points':
         let { zone, detectType } = object;
         return ` [${object.id}] <span class="type Geometry ${detectType === 'Zone' ? 'Zone' : ''
            }"></span> <span class="type-value">${zone ? `${escapeHTML(zone.name)} [${zone.id}]` : detectType
            }</span>`;
      case 'Filter':
         return ` [${object.id}]`;
      case 'Output':
         let { geometry } = object;
         return ` [${object.id}] <span class="type-value">${object.geometry
            ? `<span class="type Detect Geometry"></span>${escapeHTML(geometry.name)} [${geometry.id
            }]`
            : ''
            }</span>`;
      case 'Quantity':
         let filter = object.filter;
         return ` [${object.id}] ${filter
            ? `<span class="type Filter Modifier"></span> <span class="type-value">${escapeHTML(
               filter.name
            )} [${filter.id}]`
            : ''
            }</span>`;
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

   if ('visible' in object && !object.notHidable) {
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
