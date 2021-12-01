import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import * as CSG from '../../util/CSG/CSG';
import { createRowText, createZoneRulesPanel } from '../../util/UiUtils';
import { Editor } from '../Editor';
import { UIPanel, UIRow, UISpan, UIText } from '../libs/ui';
import { ObjectAbstract } from './Object.Abstract';
import ZoneManagerPanel from '../../components/ZoneManagerPanel/ZoneManagerPanel';

//CSG Zone UI
export class ObjectCSG extends ObjectAbstract {
	object?: CSG.Zone;

	typeRow: UIRow;
	type: UIText;

	zoneRulesRow: UIRow;
	renderZoneRules: (zone: CSG.Zone) => void;

	constructor(editor: Editor) {
		super(editor, 'Zone Operations');

		[this.typeRow, this.type] = createRowText({ text: 'Geometry Type', value: 'CSG' });
		[this.zoneRulesRow, this.renderZoneRules] = createZoneRulesPanel(this.editor);

		this.panel.add(this.typeRow, this.zoneRulesRow);
	}
	setObject(object: CSG.Zone): void {
		this.object = object;
		this.render();
	}
	update(): void {
		throw new Error('Method not implemented.');
	}
	render(): void {
		if (!this.object) return;
		this.renderZoneRules(this.object);
	}
}
